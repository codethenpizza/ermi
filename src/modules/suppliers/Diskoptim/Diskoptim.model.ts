import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'supplier_diskoptim',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class DiskoptimModel extends Model<IDiskoptimRaw> {
    @Column
    name: string;

    @Column({
        unique: true,
        allowNull: false
    })
    code: string;

    @Column
    codeSlik: string;

    @Column
    countSPB: string;

    @Column
    countMSK: string;

    @Column
    price: string;

    @Column
    priceMRC: string;

    @Column
    standardSize: string;

    @Column
    brand: string;

    @Column
    PCD: string;

    @Column
    et: string;

    @Column
    width: string;

    @Column
    diameter: string;

    @Column
    model: string;

    @Column
    DIA: string;

    @Column
    color: string;

    @Column
    type: string;

    @Column({
        type: DataType.TEXT
    })
    applicability: string;

    @Column({
        type: DataType.TEXT
    })
    image: string;
}

export interface IDiskoptimRaw {
    name: string;
    code: string;
    codeSlik: string;
    countSPB: string;
    countMSK: string;
    price: string;
    priceMRC: string;
    standardSize: string;
    brand: string;
    PCD: string;
    et: string;
    width: string;
    diameter: string;
    model: string;
    DIA: string;
    color: string;
    type: string;
    applicability: string;
    image: string;
}

export interface IDiskoptimDisk {
    name: string;
    code: string;
    codeSlik: string;
    countSPB: string;
    countMSK: string;
    price: string;
    priceMRC: string;
    standardSize: string;
    brand: string;
    PCD: string;
    et: string;
    width: string;
    diameter: string;
    model: string;
    DIA: string;
    color: string;
    type: string;
    image: string;
    applicability: string;
}

export enum DiskoptimRawDiskMap {
    'Наименование' = 'name',
    'Артикул' = 'code',
    'АртикулСЛИК' = 'codeSlik',
    'КоличествоСПБ' = 'countSPB',
    'КоличествоМСК' = 'countMSK',
    'ЦенаБаза' = 'price',
    'Цена1' = 'priceMRC',
    'Типоразмер' = 'standardSize',
    'Бренд' = 'brand',
    'PCD' = 'PCD',
    'Вылет' = 'et',
    'Ширина' = 'width',
    'Диаметр' = 'diameter',
    'Модель' = 'model',
    'DIA' = 'DIA',
    'Цвет' = 'color',
    'Модификация' = 'type',
    'СсылкаНаФото' = 'image',
    'Применяемость' = 'applicability'
}
