import {Supplier} from "./types";
import {RimMapOptions} from "./helpers/rimProductType/rimTypes";
import Product, {IProduct} from "@models/Product.model";
import {Op, Transaction} from "sequelize";
import ProductCategory, {IProductCategory} from "@models/ProductCategory.model";
import AttrValue, {IAttrValue} from "@models/AttrValue.model";
import Image from "@models/Image.model";
import ProductVariant from "@models/ProductVariant.model";
import ProductVariantImg, {IProductVariantImg} from "@models/ProductVariantImg.model";
import Attribute, {IAttribute} from "@models/Attribute.model";
import AttrSet from "@models/AttrSet.model";
import {RimAttrScheme} from "./schemas/RimAttrScheme";
import OptionsModel from "@models/Options.model";
import progressBar from "../../helpers/progressBar";
import {sequelizeTs} from "@db";
import {IProductMapper} from './interfaces/ProductMapper'
import {rimMapperRequiredOptions,} from "./helpers/rimProductType/rimProductTypeRequredOptions";
import {getFileNameFromUrl, getImageFromUrl, isDev} from "../../helpers/utils";
import config from 'config';


const mapArr: IProductMapper.MapItem[] = [
    rimMapperRequiredOptions
    // {method: 'getTires', map: 'dsa'} as IProductMapper.MapItem<TireData>,
];


export class ProductMapper {
    /**
     * Call different parse methods if exist and store data
     * @param suppliers -  array of Suppliers
     */
    public async mapProductData(suppliers: Supplier[]): Promise<void> {

        const {ProductMapperStoreLimit} = config.suppliersConfig;

        for (const supp of suppliers) {
            for (let i = 0; i < mapArr.length; i++) {
                const {method, mappingKey} = mapArr[i];

                const transaction = await sequelizeTs.transaction();
                let loadedMap;
                try {
                    loadedMap = await this.getMapping(mappingKey, mapArr[i], transaction);
                    await transaction.commit();
                } catch (e) {
                    console.log('error', e);
                    await transaction.rollback();
                    throw e;
                }

                console.log(`Start store ${supp.name} ${(method as string)}`);

                if (supp[method]) {
                    let limit = ProductMapperStoreLimit;
                    let offset = 0;

                    let data = await supp[method](limit, offset);

                    if (!data?.length) {
                        console.error(`storeRim error: supplier.${(method as string)} length 0`);
                        return;
                    }

                    while (data.length) {
                        await this.storeProducts(data, loadedMap);

                        offset = offset + limit;
                        data = await supp[method](limit, offset);
                    }
                }
            }
        }
    }

    public async storeProducts(data: any[], attrsMap: any) {
        for (const [index, item] of data.entries()) {

            try {
                if (await this.updateByCode(attrsMap, item)) {
                    progressBar(index, data.length, `Rim ${index}/${data.length}`)
                    continue;
                }

                if (await this.updateByBrandAndModel(attrsMap, item)) {
                    progressBar(index, data.length, `Rim ${index}/${data.length}`)
                    continue;
                }

                await this.createProduct(attrsMap, item);
                progressBar(index, data.length, `Rim ${index}/${data.length}`)
            } catch (e) {
                console.error(e)
            }
        }
    }


    /**
     * Return product mapping if it exist or create new one
     * @param mappingKey -  key which uses for find mapping in data base for specific product type
     * @param mapItem - object which contain all information for create product of specific type
     * @param transaction - sequelize transaction
     * @return mapping -  object which represent relation of raw data and attrs of product
     */
    public async getMapping(mappingKey: string, mapItem: IProductMapper.MapItem, transaction ?: Transaction): Promise<RimMapOptions> {
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
    private async createMapping(mapItem: IProductMapper.MapItem, transaction: Transaction): Promise<any> {
        const {mappingKey, mapping, attributes} = mapItem;
        const {attrSetName, attrSetDesc, requiredAttrs} = attributes;

        const attrs = await this.createAttributes(requiredAttrs, transaction);
        const attrSet = await this.createAttrSet(attrs, attrSetName, attrSetDesc, transaction);
        const cat = await this.createCat(mapItem.productCategory, transaction);

        const attrMap: { [key: string]: number } = attrs.reduce((map, item) => {
            map[item.name] = item.id;
            return map;
        }, {});

        let parsedMapping = Object.entries(mapping).reduce((map, [prop, propName]) => {
            return {
                ...map,
                [prop]: attrMap[propName]
            }
        }, {});

        parsedMapping = {
            ...parsedMapping,
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
    private async createAttributes(requiredAttrs: IAttribute[], transaction: Transaction): Promise<Attribute[]> {
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
    private async diffAttrs(requiredAttrs: IAttribute[], transaction: Transaction): Promise<[IAttribute[], Attribute[]]> {
        const attrs = await Attribute.findAll({where: {name: {[Op.in]: requiredAttrs.map(x => x.name)}}, transaction});
        const attrNamesSet = new Set(attrs.map(i => i.name));

        return [requiredAttrs.filter(x => !attrNamesSet.has(x.name)), attrs];
    }


    /**
     * Update product by it's brand and model set
     * @param attrs - Attribute[]
     * @param name - name of attribute set
     * @param desc - description of attribute set
     * @param transaction - sequelize transaction
     */
    private async createAttrSet(attrs: Attribute[], name: string, desc: string, transaction: Transaction): Promise<AttrSet> {
        return AttrSet.createWR({
            name,
            desc,
            scheme: RimAttrScheme,
            attributes: attrs.map(x => x.id),
        }, transaction);
    }


    /**
     * Get product by it's brand and model combination
     * @param brand - brand of product
     * @param model - model of product
     */
    private async getProductIdByBrandAndModel(brand: string, model: string): Promise<number> {
        const query = await AttrValue.sequelize.query(`
            SELECT C.product_id
            FROM ${AttrValue.tableName} A
                     LEFT JOIN ${AttrValue.tableName} B
                               ON A.product_variant_id = B.product_variant_id
                     LEFT JOIN ${ProductVariant.tableName} C
                               ON A.product_variant_id = C.id
            WHERE A.value = :brand
              AND B.value = :model LIMIT 1
        `, {
            replacements: {
                brand, model,
            },
        });
        // @ts-ignore
        const id: string = query[0][0]?.product_id;
        return id ? parseInt(id) : null;
    }


    /**
     * Update product by it's brand and model combination
     * @param mapping - set of product attrs
     * @param item - base info about product without attrs
     */
    private async updateByBrandAndModel(mapping, item): Promise<boolean> {
        const product_id = await this.getProductIdByBrandAndModel(item.brand, item.model)

        if (product_id) {
            const attrs = Object.keys(mapping).reduce<IAttrValue[]>((arr, key) => {
                const value = item[key];

                if (value) {
                    arr.push({
                        attr_id: mapping[key],
                        value
                    });
                }
                return arr;
            }, []);

            try {


                const productVariantImgs: Partial<IProductVariantImg>[] = [];

                if (item.image) {
                    try {
                        if (isDev) {
                            const img = await Image.create({original_uri: item.image});
                            productVariantImgs.push({image_id: img.id});
                        } else {
                            const data = await getImageFromUrl(item.image);
                            const name = getFileNameFromUrl(item.image)

                            const img = await Image.uploadFile({name, data});
                            productVariantImgs.push({image_id: img.id});
                        }
                    } catch (e) {
                        console.log('Error with, ', item.image, ' id', item.uid, e);
                    }
                }

                const p = await ProductVariant.create({
                    ...item,
                    product_id,
                    vendor_code: item.uid,
                    attrs,
                    price: item.price,
                    in_stock_qty: item.inStock,
                    is_available: !!item.inStock,
                    productVariantImgs
                }, {include: [AttrValue, ProductVariantImg]});
            } catch (e) {
                console.log('ERROR', e);
                const product = await Product.findByPk(product_id);
                console.log('PRODUCT', product);
            }

            return true;
        }
        return false;
    }


    /**
     * Update product by vendor code
     * @param mapping - set of product attrs
     * @param item - base info about product without attrs
     */
    private async updateByCode(mapping, item): Promise<boolean> {
        const variantByCode = await ProductVariant.findOne({
            where: {
                vendor_code: item.uid
            },
            include: [Image]
        });

        if (variantByCode) {
            const stockAttr = await AttrValue.findOne({
                where: {
                    product_variant_id: variantByCode.id,
                    attr_id: mapping.stock
                }
            });
            await stockAttr.update({
                value: item.stock
            });

            if (item.image && !variantByCode.images?.length) {
                try {
                    if (isDev) {
                        const img = await Image.create({original_uri: item.image});
                        await ProductVariantImg.create({image_id: img.id, product_variant_id: variantByCode.id});
                    } else {
                        const data = await getImageFromUrl(item.image);
                        const name = getFileNameFromUrl(item.image)

                        const img = await Image.uploadFile({name, data});
                        await ProductVariantImg.create({
                            image_id: img.id,
                            product_variant_id: variantByCode.id
                        });
                    }
                } catch (e) {
                    console.log('Error with, ', item.image, ' id', item.uid, e);
                }
            }

            await variantByCode.update({
                price: item.price,
                in_stock_qty: item.inStock
            });

            return true;
        }

        return false;
    }


    /**
     * Create product
     * @param mapping - set of product attrs
     * @param item - base info about product without attrs
     */
    private async createProduct(mapping, item) {
        const product: IProduct = {
            cats_ids: [mapping.cat],
            name: `${item.brand} ${item.model}`,
            attr_set_id: mapping.attr_set_id,
            variants: [{
                vendor_code: item.uid,
                attrs: Object.keys(mapping).reduce<IAttrValue[]>((arr, key) => {
                    const value = item[key];

                    if (value) {
                        arr.push({
                            attr_id: mapping[key],
                            value
                        });
                    }
                    return arr;
                }, []),
                price: item.price,
                in_stock_qty: item.inStock,
                is_available: !!item.inStock,
            }]
        };

        if (item.image) {
            try {
                if (isDev) {
                    const img = await Image.create({original_uri: item.image});
                    product.variants[0].productVariantImgs = [{image_id: img.id}];
                } else {
                    const data = await getImageFromUrl(item.image);
                    const name = getFileNameFromUrl(item.image)

                    const img = await Image.uploadFile({name, data});
                    product.variants[0].productVariantImgs = [{image_id: img.id}];
                }
            } catch (e) {
                console.log('Error with, ', item.image, ' id', item.uid);
                console.log(e)
            }
        }

        await Product.createWR(product);
    }


    /**
     * Create product category
     * @param productCategory - object of product category which includes name and parent_id (0 by def - create top level category)
     * @param transaction - sequelize transaction
     */
    private async createCat({
                                name,
                                parent_id = 0
                            }: IProductCategory, transaction: Transaction): Promise<ProductCategory> {
        return ProductCategory.create({
            name,
            parent_id
        }, {transaction});
    }

}
