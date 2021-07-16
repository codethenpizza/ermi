import {
    RIM_BOLTS_COUNT,
    RIM_BOLTS_SPACING,
    RIM_BRAND,
    RIM_COLOR,
    RIM_DIA,
    RIM_DIAMETER,
    RIM_ET,
    RIM_MODEL,
    RIM_PCD, RIM_SUPPLIER, RIM_SUPPLIER_STOCK,
    RIM_TYPE,
    RIM_WIDTH, RimMap,
    RimMapOptions,
    SupplierRim
} from "./types";
import OptionsModel from "@models/Options.model";
import Attribute, {AttributeI, ATTR_TYPE} from "@models/Attribute.model";
import {Op, Transaction} from "sequelize";
import AttrSet from "@models/AttrSet.model";
import Product, {IProduct} from "@models/Product.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue, {IAttrValue} from "@models/AttrValue.model";
import {sequelizeTs} from '@db'
import Image from "@models/Image.model";
import ProductVariantImg from "@models/ProductVariantImg.model";
import progressBar from "../../helpers/progressBar";
import {RimAttrScheme} from "./RimAttrScheme";
import slugify from "slugify";
import ProductCategory from "@models/ProductCategory.model";

export enum rimType {
    alloy = 'литые'
}

export class ProductMapping {
    private rimMappingKey = 'product_mapping_rim';

    private attrArr: AttributeI[] = [
        {name: RIM_MODEL, type_id: ATTR_TYPE.STRING},
        {name: RIM_BRAND, type_id: ATTR_TYPE.STRING, aggregatable: true},
        {name: RIM_COLOR, type_id: ATTR_TYPE.STRING, aggregatable: true},
        {name: RIM_WIDTH, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ШИРИНА ДИСКА
        {name: RIM_ET, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ВЫЛЕТ
        {name: RIM_DIAMETER, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ДИАМЕТР ДИСКА
        {name: RIM_BOLTS_COUNT, type_id: ATTR_TYPE.NUMBER}, //КОЛ-ВО ОТВЕРСТИЙ
        {name: RIM_BOLTS_SPACING, type_id: ATTR_TYPE.DECIMAL}, //ДИАМЕТР ОКРУЖНОСТИ
        {name: RIM_PCD, type_id: ATTR_TYPE.STRING, aggregatable: true}, //ДИАМЕТР ОКРУЖНОСТИ x КОЛ-ВО ОТВЕРСТИЙ
        {name: RIM_DIA, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
        {name: RIM_TYPE, type_id: ATTR_TYPE.STRING, aggregatable: true},
        {name: RIM_SUPPLIER, type_id: ATTR_TYPE.STRING},
        {
            name: RIM_SUPPLIER_STOCK,
            type_id: ATTR_TYPE.ARRAY,
            aggregatable: true,
            aggPath: 'shippingTime'
        },
    ];

    async storeRim(suppliers: SupplierRim[]): Promise<void> {
        const transaction = await sequelizeTs.transaction();
        let mapping: RimMapOptions;
        try {
            mapping = await this.getMapping(transaction);
            await transaction.commit();
        } catch (e) {
            console.log('error', e);
            await transaction.rollback();
            throw e;
        }

        const limit = 2000;
        for (const supplier of suppliers) {
            let offset = 0
            const total = await supplier.getDataCount();
            console.log(`Start store rim for ${supplier.name}. Total rims: ${total}`);

            for (let i = 0; i < total / limit; i++) {
                const rims = await supplier.getRims(limit, offset);
                if (!rims || !rims.length) {
                    console.error('storeRim error: supplier.getRims length 0');
                    continue;
                }
                const currentPage = Math.round(total / limit)
                for (const [index, rim] of rims.entries()) {

                    try {
                        if (await this.updateByCode(mapping, rim)) {
                            progressBar(index, rims.length, `page ${i}/${currentPage}. rim ${index}/${rims.length}`)
                            continue;
                        }

                        if (await this.updateByBrandAndModel(mapping, rim)) {
                            progressBar(index, rims.length, `page ${i}/${currentPage}. rim ${index}/${rims.length}`)
                            continue;
                        }

                        await this.createProduct(mapping, rim);
                        progressBar(index, rims.length, `page ${i}/${currentPage}. rim ${index}/${rims.length}`)
                    } catch (e) {
                        console.error(e)
                    }
                }
                offset += limit;
            }
        }
    }


    public async getMapping(transaction ?: Transaction): Promise<RimMapOptions> { // props: mapping-key, attr-array
        const mapping = await OptionsModel.findOne({where: {key: this.rimMappingKey}, transaction});
        if (!mapping) {
            return this.crateMapping(transaction)
        }
        return JSON.parse(mapping.value);
    }

    private async crateMapping(transaction: Transaction): Promise<RimMapOptions> {
        const attrs = await this.createAttributes(transaction);

        const attrSet = await this.createAttrSet(attrs, transaction);

        const cat = await this.createCat(transaction);

        const attrMap: { [key: string]: number } = attrs.reduce((map, item) => {
            map[item.name] = item.id;
            return map;
        }, {});
        const mapping: RimMapOptions = {
            attr_set_id: attrSet.id,
            model: attrMap[RIM_MODEL],
            brand: attrMap[RIM_BRAND],
            color: attrMap[RIM_COLOR],
            width: attrMap[RIM_WIDTH],
            et: attrMap[RIM_ET],
            diameter: attrMap[RIM_DIAMETER],
            bolts_count: attrMap[RIM_BOLTS_COUNT],
            bolts_spacing: attrMap[RIM_BOLTS_SPACING],
            pcd: attrMap[RIM_PCD],
            dia: attrMap[RIM_DIA],
            type: attrMap[RIM_TYPE],
            supplier: attrMap[RIM_SUPPLIER],
            stock: attrMap[RIM_SUPPLIER_STOCK],
            cat: cat.id
        };

        await this.saveMapping(mapping, transaction);
        return mapping;
    }

    private async saveMapping(mapping: RimMapOptions, transaction: Transaction): Promise<void> {
        await OptionsModel.create({
            key: this.rimMappingKey,
            value: JSON.stringify(mapping)
        }, {transaction})
    }

    private async createAttributes(transaction: Transaction): Promise<Attribute[]> { // attr-array
        const [notExistAttrs, existAttrs] = await this.diffAttrs(transaction);
        const attrs = await Attribute.bulkCreate(notExistAttrs, {transaction});
        attrs.push(...existAttrs);

        return attrs;
    }

    private async diffAttrs(transaction: Transaction): Promise<[AttributeI[], Attribute[]]> { // attr-array
        const attrs = await Attribute.findAll({where: {name: {[Op.in]: this.attrArr.map(x => x.name)}}, transaction});

        return [this.attrArr.filter(x => !attrs.find(a => a.name === x.name)), attrs];
    }

    private async createAttrSet(attrs: Attribute[], transaction: Transaction): Promise<AttrSet> {
        return AttrSet.createWR({
            name: 'Rim',
            desc: 'Rim attribute set from module',
            scheme: RimAttrScheme,
            attributes: attrs.map(x => x.id),
        }, transaction);
    }

    private async getProductIdByBrandAndModel(brand, model): Promise<number> {
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

    private async updateByCode(mapping: RimMapOptions, rim: RimMap): Promise<boolean> {
        const variantByCode = await ProductVariant.findOne({
            where: {
                vendor_code: rim.uid
            }
        });

        if (variantByCode) {
            variantByCode.price = rim.price;
            variantByCode.in_stock_qty = rim.inStock;

            await variantByCode.save();

            const stockAttr = await AttrValue.findOne({
                where: {
                    product_variant_id: variantByCode.id,
                    attr_id: mapping.stock
                }
            });
            stockAttr.value = rim.stock;

            await stockAttr.save();
            return true;
        }

        return false;
    }

    private async updateByBrandAndModel(mapping: RimMapOptions, rim: RimMap): Promise<boolean> {
        const product_id = await this.getProductIdByBrandAndModel(rim.brand, rim.model)

        if (product_id) {
            //create variant with rim
            const attrs = Object.keys(mapping).reduce<IAttrValue[]>((arr, key) => {
                const value = rim[key];

                if (value) {
                    arr.push({
                        attr_id: mapping[key],
                        value
                    });
                }
                return arr;
            }, []);

            try {


                const productVariant = await ProductVariant.create({
                    ...rim,
                    product_id,
                    vendor_code: rim.uid,
                    attrs,
                    price: rim.price,
                    in_stock_qty: rim.inStock,
                    is_available: !!rim.inStock
                }, {include: [AttrValue]});


                if (rim.image) {
                    try {
                        const img = await Image.create({original_uri: rim.image});

                        await ProductVariantImg.create({
                            image_id: img.id,
                            product_variant_id: productVariant.id
                        });
                    } catch (e) {
                        console.log('Error with, ', rim.image, ' id', rim.uid, e);
                    }
                }
            } catch (e) {
                console.log('ERROR', e);
                const product = await Product.findByPk(product_id);
                console.log('PRODUCT', product);
            }

            return true;
        }
        return false;
    }

    private async createProduct(mapping: RimMapOptions, rim: RimMap) {
        const product: IProduct = {
            cats_ids: [mapping.cat],
            name: `${rim.brand} ${rim.model}`,
            attr_set_id: mapping.attr_set_id,
            variants: [{
                vendor_code: rim.uid,
                attrs: Object.keys(mapping).reduce<IAttrValue[]>((arr, key) => {
                    const value = rim[key];

                    if (value) {
                        arr.push({
                            attr_id: mapping[key],
                            value
                        });
                    }
                    return arr;
                }, []),
                price: rim.price,
                in_stock_qty: rim.inStock,
                is_available: !!rim.inStock
            }]
        };

        if (rim.image) {
            try {
                const img = await Image.create({original_uri: rim.image});
                product.variants[0].images = [{id: img.id}];
            } catch (e) {
                console.log('Error with, ', rim.image, ' id', rim.uid);
                console.log(e)
            }
        }

        await Product.createWR(product);
    }

    private async createCat(transaction: Transaction): Promise<ProductCategory> {
        return ProductCategory.create({
            name: 'Rims',
            parent_id: 0,
        }, {transaction});
    }
}
