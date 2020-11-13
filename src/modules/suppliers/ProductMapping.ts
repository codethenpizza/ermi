import {
    DISK_BOLTS_COUNT,
    DISK_BOLTS_SPACING,
    DISK_BRAND,
    DISK_COLOR,
    DISK_DIA,
    DISK_DIAMETER,
    DISK_ET,
    DISK_MODEL,
    DISK_PCD,
    DISK_PCD2,
    DISK_TYPE,
    DISK_WIDTH,
    DiskMapOptions,
    SupplierDisk
} from "./types";
import OptionsModel from "@models/Options.model";
import Attribute, {AttributeI} from "@models/Attribute.model";
import {Op, Transaction} from "sequelize";
import AttrSet from "@models/AttrSet.model";
import Product, {IProduct} from "@models/Product.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue, {IAttrValue} from "@models/AttrValue.model";
import {sequelize} from '@db'
import Image from "@models/Image.model";

export enum diskType {
    alloy = 'литые'
}

export class ProductMapping {
    private rimMappingKey = 'product_mapping_rim';

    private attrArr: AttributeI[] = [
        {name: DISK_MODEL, type_id: 1},
        {name: DISK_BRAND, type_id: 1},
        {name: DISK_COLOR, type_id: 1},
        {name: DISK_WIDTH, type_id: 3}, //ШИРИНА ДИСКА
        {name: DISK_ET, type_id: 3}, //ВЫЛЕТ
        {name: DISK_DIAMETER, type_id: 3}, //ДИАМЕТР ДИСКА
        {name: DISK_BOLTS_COUNT, type_id: 2}, //КОЛ-ВО ОТВЕРСТИЙ
        {name: DISK_BOLTS_SPACING, type_id: 3},
        {name: DISK_PCD, type_id: 3}, //ДИАМЕТР ОКРУЖНОСТИ* bolts_spacing
        {name: DISK_PCD2, type_id: 3}, //ДИАМЕТР ОКРУЖНОСТИ 2 bolts_spacing 2
        {name: DISK_DIA, type_id: 3}, // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
        {name: DISK_TYPE, type_id: 1}
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

            let created = 0;
            for (const [index, rim] of rims.entries()) {
                console.log('current', index)

                //find one
                const variantByCode = await ProductVariant.findOne({
                    where: {
                        vendor_code: rim.uid
                    }
                })
                // console.log('variantByCode', variantByCode)
                if (variantByCode) {
                    //update variant
                    ProductVariant.update(rim, {
                        where: {
                            vendor_code: rim.uid
                        }
                    })
                    continue;
                }

                const product_id = await this.getProductIdByVariantAndModel(mapping, rim.brand, rim.model)
                if (product_id) {
                    //create variant with rim
                    console.log('UPDATE BY PRODUCT ID')
                    // ProductVariant.create(rim, {
                    //     where: {
                    //         product_id: product_id
                    //     }
                    // })
                    // Product.update()
                    continue;
                }
                console.log('CREATE PRODUCT')

                //create product
                const product: IProduct = {
                    cats_ids: [0],
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
                    const img = await Image.create({original_uri: rim.image});
                    product.variants[0].images = [{id: img.id}];
                }

                try {
                    await Product.createWR(product);
                    created++
                } catch (e) {
                    console.error(e)
                }
            }
            await ProductVariant.update({is_available: false, in_stock_qty: 0},
                {
                    where: {
                        [Op.and]: [
                            {vendor_code: {[Op.regexp]: `^${suppCode}`}},
                            {vendor_code: {[Op.notIn]: rims.map(x => x.uid)}},
                        ]
                    }
                });
        }

    }

    public async getMapping(transaction?: Transaction): Promise<DiskMapOptions> {
        const mapping = await OptionsModel.findOne({where: {key: this.rimMappingKey}, transaction});
        if (!mapping) {
            return this.crateMapping(transaction)
        }
        return JSON.parse(mapping.value);
    }

    private async crateMapping(transaction: Transaction): Promise<DiskMapOptions> {
        const attrs = await this.createAttributes(transaction);

        const attrSet = await this.createAttrSet(attrs, transaction);

        const attrMap: { [key: string]: number } = attrs.reduce((map, item) => {
            map[item.name] = item.id;
            return map;
        }, {});
        const mapping: DiskMapOptions = {
            attr_set_id: attrSet.id,
            model: attrMap['Model'],
            brand: attrMap['Brand'],
            color: attrMap['Color'],
            width: attrMap['Width'],
            et: attrMap['ET'],
            diameter: attrMap['Diameter'],
            bolts_count: attrMap['Bolts count'],
            bolts_spacing: attrMap['Bolts spacing'],
            pcd: attrMap['PCD'],
            pcd2: attrMap['PCD2'],
            dia: attrMap['DIA'],
            type: attrMap['Type'],
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
            attributes: attrs.map(x => x.id)
        }, transaction);
    }

    private async getProductIdByVariantAndModel(mapping, brand, model): Promise<number | null> {
        const existedProductVariantsModels = await ProductVariant.findAll({
            include: [Product, {
                model: AttrValue,
                where: {
                    attr_id: [mapping.model, mapping.brand],
                    value: [model, brand]
                },
            }]
        })

        const existedProductVariant = existedProductVariantsModels.find(variant => {
            //console.log(variant.attrs, rim)
            const isSameBrand = variant.attrs.some(attr => {
                const isAttrBrand = attr.attr_id === mapping.brand;
                const isRimBrand = attr.value === brand;
                // console.log(attr.value, rim.brand)
                if (isAttrBrand && isRimBrand) {
                    return attr
                }
            })

            const isSameModel = variant.attrs.some(attr => {
                const isAttrModel = attr.attr_id === mapping.model;
                const isRimModel = attr.value === model;
                //console.log(attr.value, rim.model)
                if (isAttrModel && isRimModel) {
                    return attr
                }
            })

            //console.log('what we find', isSameBrand, isSameModel)
            if (isSameBrand && isSameModel) {
                return variant
            }
        })
        if (existedProductVariant) {
            console.log('find by model and brand', existedProductVariant.product_id);
            return existedProductVariant.product_id
        }

        return null
    }
}
