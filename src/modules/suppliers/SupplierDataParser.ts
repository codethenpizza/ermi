import {Op, Transaction} from "sequelize";
import ProductCategory, {IProductCategory} from "@core/models/ProductCategory.model";
import Attribute, {IAttribute} from "@core/models/Attribute.model";
import AttrSet from "@core/models/AttrSet.model";
import OptionsModel from "@core/models/Options.model";
import progressBar from "../../core/helpers/progressBar";
import {IProductMapper} from './interfaces/ProductMapper'
import {sequelizeTs} from "@core/database";
import {ProductUseCases} from "@core/useCases/ProductUseCases/ProductUseCases";
import {CountParams, OptionsIDMapping, ParsedData, SupplierDataParserConfig} from "./types";
import {OfferUseCases} from "@core/useCases/OfferUseCases/OfferUseCases";
import {IOfferCreateProductData} from "@core/useCases/OfferUseCases/types";
import AttrSetAttr, {IAttrSetAttr} from "@core/models/AttrSetAttr.model";
import {Supplier} from "./interfaces/Supplier";
import {IOfferCreateOptions} from "@core/services/offer/types";
import {VendorOfferAlreadyExistsInVariant} from "@core/useCases/OfferUseCases/errors";


export class SupplierDataParser {

    constructor(
        private config: SupplierDataParserConfig,
        private productUseCases: ProductUseCases,
        private offerUseCases: OfferUseCases
    ) {
    }

    /**
     * Call different parse methods and store data if exists
     * @param suppliers -  array of Suppliers
     * @param productTypeOptionsArr = array of ProductTypeOptions
     */
    public async parseData(suppliers: Supplier[], productTypeOptionsArr: IProductMapper.ProductTypeOptions[]): Promise<void> {

        for (const supp of suppliers) {
            for (const productTypeOptions of productTypeOptionsArr) {
                const {method, mappingKey, getProductFindOptionsFns} = productTypeOptions;

                const getData: Function = supp[method].bind(supp);

                const totalItems = await supp.getDataCount();

                // get attribute IDs map for current product type
                const transaction = await sequelizeTs.transaction();
                let attrIdsMap: OptionsIDMapping;
                try {
                    attrIdsMap = await this.getAttrIdsMap(mappingKey, productTypeOptions, transaction);
                    await transaction.commit();
                } catch (e) {
                    await transaction.rollback();
                    throw e;
                }


                if (getData) {
                    console.log(`Start parse "${supp.name}" with method "${(method as string)}"`);

                    let limit = parseInt(this.config.dataParserLimit);
                    let offset = 0;

                    let data: ParsedData[] = await getData(limit, offset);

                    if (!data?.length) {
                        console.error(`storeRim error: supplier.${(method as string)} length 0`);
                        return;
                    }

                    const {findProductVariantIdFn, findProductIdFn} = await getProductFindOptionsFns(attrIdsMap);

                    const productFindOptions: IOfferCreateOptions = {
                        findProductVariantIdFn,
                        findProductIdFn
                    }

                    while (data.length) {
                        await this.updateOffers(data, attrIdsMap, {total: totalItems, offset}, productFindOptions);

                        offset += limit;
                        data = await getData(limit, offset);
                    }
                }
            }
        }
    }

    private async updateOffers(data: ParsedData[], attrIdsMap: OptionsIDMapping, countParams: CountParams, productFindOptions?: IOfferCreateOptions) {
        for (const [index, itemData] of data.entries()) {
            try {
                const mappedOfferProductData: IOfferCreateProductData =
                    this.mapOfferProductDataAttrs(itemData.productData, itemData.attrValuesMap, attrIdsMap);

                itemData.productData.attr_set_id = attrIdsMap.attr_set_id;
                if (attrIdsMap.cat !== undefined) {
                    itemData.productData.cat_ids = [attrIdsMap.cat];
                }

                try {

                    await this.offerUseCases.updateOrCreate(itemData.offerData, mappedOfferProductData, productFindOptions);

                } catch (e) {

                    if (e instanceof VendorOfferAlreadyExistsInVariant) {

                        const {offerDataToCreate, existedOffer} = e;

                        if (offerDataToCreate.in_stock_qty > existedOffer.in_stock_qty) {
                            await existedOffer.destroy();
                            await this.offerUseCases.updateOrCreate(itemData.offerData, mappedOfferProductData, productFindOptions);
                        }

                    } else {
                        throw e;
                    }

                }
                progressBar(countParams.offset + index + 1, countParams.total, `Rim ${countParams.offset + index + 1}/${countParams.total}`);
            } catch (e) {
                console.error(e);
            }
        }
    }


    private mapOfferProductDataAttrs(
        productData: IOfferCreateProductData,
        attrValuesMap: Record<string, any>,
        attrIdsMap: Record<string, number>
    ): IOfferCreateProductData {
        productData.productVariant.attrs = Object.entries(attrValuesMap).reduce((acc, [key, value]) => {
            const attrID = attrIdsMap[key];
            if (value && attrID) {
                acc.push({
                    attr_id: attrID,
                    value
                });
            }

            return acc;
        }, []);

        return productData;
    }


    /**
     * Return product mapping if it exist or create new one
     * @param mappingKey -  key which uses for find mapping in data base for specific product type
     * @param mapItem - object which contain all information for create product of specific type
     * @param transaction - sequelize transaction
     * @return mapping -  object which represent relation of raw data and attrs of product
     */
    private async getAttrIdsMap(mappingKey: string, mapItem: IProductMapper.ProductTypeOptions, transaction?: Transaction): Promise<OptionsIDMapping> {
        const mapping = await OptionsModel.findOne({where: {key: mappingKey}, transaction});
        if (!mapping) {
            return this.createMapping(mapItem, transaction)
        }
        return JSON.parse(mapping.value);
    }


    /**
     * Create product mapping
     * @param mapItem - key which uses for find mapping in data base for specific product type
     * @param transaction - sequelize transaction
     * @return mapping - object which represent relation of raw data and attrs of product
     */
    private async createMapping(mapItem: IProductMapper.ProductTypeOptions, transaction: Transaction): Promise<OptionsIDMapping> {
        const {mappingKey, mapping, attributes, productCategory} = mapItem;
        const {attrSetName, attrSetDesc, requiredAttrs, attrSetScheme} = attributes;

        const attrs = await this.createAttributes(requiredAttrs, transaction);
        const attrSet = await this.createAttrSet(attrs, attrSetName, attrSetDesc, attrSetScheme, transaction);
        const cat = await this.findOrCreateCat(productCategory, transaction);

        const attrMap: { [key: string]: number } = attrs.reduce((map, item) => {
            map[item.name] = item.id;
            return map;
        }, {});

        const parsedMappingAttrs: Partial<OptionsIDMapping> = Object.entries(mapping).reduce<Partial<OptionsIDMapping>>((map, [prop, propName]) => {
            return {
                ...map,
                [prop]: attrMap[propName]
            }
        }, {});

        const parsedMapping: OptionsIDMapping = {
            ...parsedMappingAttrs,
            attr_set_id: attrSet.id,
            cat: cat.id
        }

        console.log('createMapping: parsedMapping', parsedMapping);

        await this.saveMapping(parsedMapping, mappingKey, transaction);
        return parsedMapping;
    }


    /**
     * Create or get exited attrs
     * @param mapping - ??
     * @param mappingKey - key which uses for find mapping in data base for specific product type
     * @param transaction - sequelize transaction
     * @return Attribute[] - array of Attributes
     */
    private async saveMapping(mapping, mappingKey: string, transaction: Transaction): Promise<void> {
        await OptionsModel.create({
            key: mappingKey,
            value: JSON.stringify(mapping)
        }, {transaction})
    }


    /**
     * Create or get exited attrs
     * @param requiredAttrs - array of required attrs for specified product from IProductMapper.MapItem
     * @param transaction - sequelize transaction
     * @return Attribute[] - array of Attributes
     */
    private async createAttributes(requiredAttrs: Omit<IAttribute, 'id' | 'slug'>[], transaction: Transaction): Promise<Attribute[]> {
        const [notExistAttrs, existAttrs] = await this.diffAttrs(requiredAttrs, transaction);
        const createdAttrs = await Attribute.bulkCreate(notExistAttrs, {transaction});

        return [...createdAttrs, ...existAttrs];
    }


    /**
     * Find difference between existed and required attrs.
     * @param requiredAttrs - array of required attrs for specified product type from IProductMapper.MapItem
     * @param transaction - sequelize transaction
     * @return IAttribute[] - array of required but not created attrs
     */
    private async diffAttrs(requiredAttrs: Omit<IAttribute, 'id' | 'slug'>[], transaction: Transaction): Promise<[Omit<IAttribute, 'id' | 'slug'>[], Attribute[]]> {
        const attrs = await Attribute.findAll({where: {name: {[Op.in]: requiredAttrs.map(x => x.name)}}, transaction});
        const attrNamesSet = new Set(attrs.map(i => i.name));

        return [requiredAttrs.filter(x => !attrNamesSet.has(x.name)), attrs];
    }


    /**
     * Update product by it's brand and model set
     * @param attrs - Attribute[]
     * @param name - name of attribute set
     * @param desc - description of attribute set
     * @param scheme - scheme of attribute set
     * @param transaction - sequelize transaction
     */
    private async createAttrSet(attrs: Attribute[], name: string, desc: string, scheme: Object, transaction: Transaction): Promise<AttrSet> {
        const attrSet = await AttrSet.create({
            name,
            desc,
            scheme,
        }, {transaction});

        await AttrSetAttr.bulkCreate(attrs.map<IAttrSetAttr>(x => ({
            attr_id: x.id,
            attr_set_id: attrSet.id
        })), {transaction});

        return attrSet.reload({include: [Attribute], transaction});
    }


    /**
     * Create product category
     * @param productCategory - object of product category which includes name and parent_id (0 by def - create top level category)
     * @param transaction - sequelize transaction
     */
    private async findOrCreateCat(
        {name, parent_id = 0}: Omit<IProductCategory, 'id'>,
        transaction?: Transaction
    ): Promise<ProductCategory> {

        const cat = await ProductCategory.findOne({where: {name}, transaction});

        if (cat) {
            return cat;
        }

        return ProductCategory.create({
            name,
            parent_id
        }, {transaction});
    }

}
