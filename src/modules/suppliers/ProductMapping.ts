import {
    DISK_BOLTS_COUNT,
    DISK_BOLTS_SPACING,
    DISK_BRAND,
    DISK_COLOR,
    DISK_DIA,
    DISK_DIAMETER,
    DISK_ET,
    DISK_MODEL,
    DISK_PCD, DISK_SUPPLIER, DISK_SUPPLIER_STOCK,
    DISK_TYPE,
    DISK_WIDTH, DiskMap,
    DiskMapOptions,
    SupplierDisk
} from "./types";
import OptionsModel from "@models/Options.model";
import Attribute, {AttributeI, ATTR_TYPE} from "@models/Attribute.model";
import {Op, Transaction} from "sequelize";
import AttrSet from "@models/AttrSet.model";
import Product, {IProduct} from "@models/Product.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue, {IAttrValue} from "@models/AttrValue.model";
import {sequelize} from '@db'
import Image from "@models/Image.model";
import ProductVariantImg from "@models/ProductVariantImg.model";
import progressBar from "../../helpers/progressBar";
import {RimAttrScheme} from "./RimAttrScheme";
import slugify from "slugify";
import ProductCategory from "@models/ProductCategory.model";

export enum diskType {
    alloy = 'литые'
}

export class ProductMapping {
    private rimMappingKey = 'product_mapping_rim';

    private attrArr: AttributeI[] = [
        {name: DISK_MODEL, type_id: ATTR_TYPE.STRING},
        {name: DISK_BRAND, type_id: ATTR_TYPE.STRING, aggregatable: true},
        {name: DISK_COLOR, type_id: ATTR_TYPE.STRING, aggregatable: true},
        {name: DISK_WIDTH, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ШИРИНА ДИСКА
        {name: DISK_ET, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ВЫЛЕТ
        {name: DISK_DIAMETER, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ДИАМЕТР ДИСКА
        {name: DISK_BOLTS_COUNT, type_id: ATTR_TYPE.NUMBER}, //КОЛ-ВО ОТВЕРСТИЙ
        {name: DISK_BOLTS_SPACING, type_id: ATTR_TYPE.DECIMAL}, //ДИАМЕТР ОКРУЖНОСТИ
        {name: DISK_PCD, type_id: ATTR_TYPE.STRING, aggregatable: true}, //ДИАМЕТР ОКРУЖНОСТИ x КОЛ-ВО ОТВЕРСТИЙ
        {name: DISK_DIA, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
        {name: DISK_TYPE, type_id: ATTR_TYPE.STRING, aggregatable: true},
        {name: DISK_SUPPLIER, type_id: ATTR_TYPE.STRING},
        {
            name: DISK_SUPPLIER_STOCK,
            type_id: ATTR_TYPE.ARRAY,
            aggregatable: true,
            aggPath: 'shippingTime'
        },
    ];

    async storeDisk(suppliers: SupplierDisk[]): Promise<void> {
        const transaction = await sequelize.transaction();
        let mapping: DiskMapOptions;
        try {
            mapping = await this.getMapping(transaction);
            await transaction.commit();
        } catch (e) {
            console.log('error', e);
            await transaction.rollback();
            throw e;
        }

        for (const supplier of suppliers) {

            const rims = await supplier.getRims();
            if (!rims || !rims.length) {
                console.error('storeDisk error: supplier.getRims length 0');
                continue;
            }
            console.log(rims.length)
            const suppCode = rims[0].uid.split('_')[0];
            console.log('Start store disk for', suppCode);

            for (const [index, rim] of rims.entries()) {

                try {
                    if (await this.updateByCode(mapping, rim)) {
                        progressBar(index, rims.length)
                        continue;
                    }

                    if (await this.updateByBrandAndModel(mapping, rim)) {
                        progressBar(index, rims.length)
                        continue;
                    }

                    await this.createProduct(mapping, rim);
                    progressBar(index, rims.length)
                } catch (e) {
                    console.error(e)
                }

            }
        }
    }


    public async getMapping(transaction ?: Transaction): Promise<DiskMapOptions> {
        const mapping = await OptionsModel.findOne({where: {key: this.rimMappingKey}, transaction});
        if (!mapping) {
            return this.crateMapping(transaction)
        }
        return JSON.parse(mapping.value);
    }

    private async crateMapping(transaction: Transaction): Promise<DiskMapOptions> {
        const attrs = await this.createAttributes(transaction);

        const attrSet = await this.createAttrSet(attrs, transaction);

        const cat = await this.createCat(transaction);

        const attrMap: { [key: string]: number } = attrs.reduce((map, item) => {
            map[item.name] = item.id;
            return map;
        }, {});
        const mapping: DiskMapOptions = {
            attr_set_id: attrSet.id,
            model: attrMap[DISK_MODEL],
            brand: attrMap[DISK_BRAND],
            color: attrMap[DISK_COLOR],
            width: attrMap[DISK_WIDTH],
            et: attrMap[DISK_ET],
            diameter: attrMap[DISK_DIAMETER],
            bolts_count: attrMap[DISK_BOLTS_COUNT],
            bolts_spacing: attrMap[DISK_BOLTS_SPACING],
            pcd: attrMap[DISK_PCD],
            dia: attrMap[DISK_DIA],
            type: attrMap[DISK_TYPE],
            supplier: attrMap[DISK_SUPPLIER],
            stock: attrMap[DISK_SUPPLIER_STOCK],
            cat: cat.id
        };

        await this.saveMapping(mapping, transaction);
        return mapping;
    }

    private async saveMapping(mapping: DiskMapOptions, transaction: Transaction): Promise<void> {
        await OptionsModel.create({
            key: this.rimMappingKey,
            value: JSON.stringify(mapping)
        }, {transaction})
    }

    private async createAttributes(transaction: Transaction): Promise<Attribute[]> {
        const [notExistAttrs, existAttrs] = await this.diffAttrs(transaction);
        const attrs = await Attribute.bulkCreate(notExistAttrs, {transaction});
        attrs.push(...existAttrs);

        return attrs;
    }

    private async diffAttrs(transaction: Transaction): Promise<[AttributeI[], Attribute[]]> {
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
             ON A.product_variant_id  = C.id
            WHERE
             A.value = '${brand}'
             AND B.value = '${model}'
            LIMIT 1
        `);
        // @ts-ignore
        const id: string = query[0][0]?.product_id;
        return id ? parseInt(id) : null;
    }

    private async updateByCode(mapping: DiskMapOptions, rim: DiskMap): Promise<boolean> {
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

    private async updateByBrandAndModel(mapping: DiskMapOptions, rim: DiskMap): Promise<boolean> {
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

    private async createProduct(mapping: DiskMapOptions, rim: DiskMap) {
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
        return  ProductCategory.create({
            name: 'Rims',
            parent_id: 0,
        }, {transaction});
    }
}
