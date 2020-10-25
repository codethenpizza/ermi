import {
    DISK_BOLTS_COUNT,
    DISK_BOLTS_SPACING,
    DISK_BRAND,
    DISK_COLOR, DISK_DIA, DISK_DIAMETER, DISK_ET, DISK_PCD,
    DISK_PCD2, DISK_RECOMMENDED_PRICE, DISK_TYPE,
    DISK_WIDTH,
    DiskMap,
    DiskMapOptions,
    SupplierDisk
} from "./types";
import progressBar from "../../helpers/progressBar"
import OptionsModel from "@models/Options.model";
import Attribute, {AttributeI} from "@models/Attribute.model";
import {Op, Transaction} from "sequelize";
import AttrSet from "@models/AttrSet.model";
import Product, {IProduct} from "@models/Product.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue, {IAttrValue} from "@models/AttrValue.model";
import {sequelize} from '@db'

export enum diskType {
    alloy = 'литые'
}

export class ProductMapping {
    private rimMappingKey = 'product_mapping_rim';

    private attrArr: AttributeI[] = [
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
        {name: DISK_RECOMMENDED_PRICE, type_id: 3},
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
                console.error('storeDisk error: supplier.getRims length 0'); //TODO: add try catch block/supplier name?
                return;
            }
            const suppCode = rims[0].uid.split('_')[0];
            console.log('Start store disk for', suppCode);
            const existedProductVariants = await ProductVariant.findAll({
                where: {vendor_code: {[Op.in]: rims.map(x => x.uid)}},
                include: [Product, AttrValue]
            });
            const notExistedProductVariants = rims.filter(rim => !existedProductVariants.find(x => x.vendor_code === rim.uid));

            const rimsMap: { [key: string]: DiskMap } = rims.reduce((map, item) => {
                map[item.uid] = item;
                return map;
            }, {});

            for (const [i, rim] of existedProductVariants.entries()) {
                const data = rimsMap[rim.vendor_code];
                await Product.updateWR(rim.product_id, {
                    name: data.model_name,
                    variants: [{
                        id: rim.id,
                        attrs: Object.keys(mapping).reduce<IAttrValue[]>((arr, key) => {
                            const value = data[key];

                            if (value) {
                                arr.push({
                                    id: rim.attrs.find(x => x.attr_id === mapping[key])?.id,
                                    product_variant_id: rim.id,
                                    attr_id: mapping[key],
                                    value
                                });
                            }
                            return arr;
                        }, []),
                        price: data.price,
                        in_stock_qty: data.inStock,
                        is_available: !!data.inStock
                    }]
                });
                progressBar(i + 1, existedProductVariants.length, 'existedProductVariants update');
            }

            for (const [i, rim] of notExistedProductVariants.entries()) {
                const data = rimsMap[rim.uid];

                const product: IProduct = {
                    cats_ids: [0],
                    name: rim.model_name,
                    attr_set_id: mapping.attr_set_id,
                    variants: [{
                        vendor_code: rim.uid,
                        attrs: Object.keys(mapping).reduce<IAttrValue[]>((arr, key) => {
                            const value = data[key];

                            if (value) {
                                arr.push({
                                    attr_id: mapping[key],
                                    value
                                });
                            }
                            return arr;
                        }, []),
                        price: data.price,
                        in_stock_qty: data.inStock,
                        is_available: !!data.inStock
                    }]
                };

                try {
                    await Product.createWR(product);
                } catch (e) {
                    console.error(e)
                }
                progressBar(i + 1, notExistedProductVariants.length, 'notExistedProductVariants create');
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

    private async getMapping(transaction: Transaction): Promise<DiskMapOptions> {
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
}
