import {SupplierDisk} from "./types";
import OptionsModel from "@models/Options.model";
import Attribute, {AttributeI} from "@models/Attribute.model";
import {Op, Transaction} from "sequelize";
import AttrSet from "@models/AttrSet.model";
import Product, {IProduct} from "@models/Product.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue, {IAttrValue} from "@models/AttrValue.model";
import {sequelize} from '@db'

export interface DiskMap {
    model_name: string; // ДИСК
    brand: string;
    uid: string;
    color: string;
    width: number; //ШИРИНА ДИСКА
    et: number;  //ВЫЛЕТ
    diameter: number; //ДИАМЕТР ДИСКА
    bolts_count: number; //КОЛ-ВО ОТВЕРСТИЙ
    bolts_spacing: number;
    pcd: number; //ДИАМЕТР ОКРУЖНОСТИ* bolts_spacing
    pcd2?: number; //ДИАМЕТР ОКРУЖНОСТИ 2 bolts_spacing 2
    dia: number; // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
    image: string;
    price: number;
    priceMRC: number;
    inStock: number;
    type: string;

    // countUSN?: number;
    // count_rst?: number;
    // count_chl?: number;
    // count_nsb?: number;
    //
    // //непонятная хуйня
    // USN: boolean;
    // cap: string;
    // capR: string;
    // auto: string;
    // fix: string;
    // fixcode: string;
}

export interface DiskMapOptions {
    brand: number;
    color: number;
    width: number; //ШИРИНА ДИСКА
    et: number;  //ВЫЛЕТ
    diameter: number; //ДИАМЕТР ДИСКА
    bolts_count: number; //КОЛ-ВО ОТВЕРСТИЙ
    bolts_spacing: number;
    pcd: number; //ДИАМЕТР ОКРУЖНОСТИ* bolts_spacing
    pcd2?: number; //ДИАМЕТР ОКРУЖНОСТИ 2 bolts_spacing 2
    dia: number; // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
    priceMRC: number;
    type: number;
    attr_set_id: number;
}


export class ProductMapping {
    private rimMappingKey = 'product_mapping_rim';

    private attrArr: AttributeI[] = [
        {name: 'Brand', type_id: 1},
        {name: 'Color', type_id: 1},
        {name: 'Width', type_id: 3}, //ШИРИНА ДИСКА
        {name: 'ET', type_id: 3}, //ВЫЛЕТ
        {name: 'Diameter', type_id: 3}, //ДИАМЕТР ДИСКА
        {name: 'Bolts count', type_id: 2}, //КОЛ-ВО ОТВЕРСТИЙ
        {name: 'Bolts spacing', type_id: 3},
        {name: 'PCD', type_id: 3}, //ДИАМЕТР ОКРУЖНОСТИ* bolts_spacing
        {name: 'PCD2', type_id: 3}, //ДИАМЕТР ОКРУЖНОСТИ 2 bolts_spacing 2
        {name: 'DIA', type_id: 3}, // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
        {name: 'Recommended price', type_id: 3},
        {name: 'Type', type_id: 1}
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

            const suppCode = rims[0].uid.split('_')[0];

            const existedProductVariants = await ProductVariant.findAll({
                where: {vendor_code: {[Op.in]: rims.map(x => x.uid)}},
                include: [Product, AttrValue]
            });
            const notExistedProductVariants = rims.filter(rim => !existedProductVariants.find(x => x.vendor_code === rim.uid));

            const rimsMap: { [key: string]: DiskMap } = rims.reduce((map, item) => {
                map[item.uid] = item;
                return map;
            }, {});

            for (const rim of existedProductVariants) {
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
            }

            for (const rim of notExistedProductVariants) {
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

                await Product.createWR(product);
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
            priceMRC: attrMap['Recommended price'],
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


