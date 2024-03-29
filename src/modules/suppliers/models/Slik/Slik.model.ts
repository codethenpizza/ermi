import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'supplier_silk',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class SlikModel extends Model<ISilkRaw> implements ISilkRaw {
    @Column({
        unique: true,
        allowNull: false
    })
    code: string;

    @Column
    brand: string;

    @Column
    model: string;

    @Column
    color: string;

    @Column
    width: string;

    @Column
    diameter: string;

    @Column
    bolts_count: string;

    @Column
    bolts_spacing: string;

    @Column
    bolts_spacing2: string;

    @Column
    fix: string;

    @Column
    et: string;

    @Column
    dia: string;

    @Column
    fixcode: string;

    @Column
    cap: string;

    @Column
    capR: string;

    @Column
    auto: string;

    @Column({
        type: DataType.TEXT
    })
    image: string;

    @Column
    price: string;

    @Column
    priceMRC: string;

    @Column
    USN: string;

    @Column
    stock: string;

    @Column
    count: string;

    @Column
    countUSN: string;

    @Column
    count_rst: string;

    @Column
    count_chl: string;

    @Column
    count_nsb: string;

    @Column
    cnt_mnf: string;

    @Column
    onlyR: string;
}

export interface ISilkRaw {
    code: string;
    brand: string;
    model: string;
    color: string;
    width: string;
    diameter: string;
    bolts_count: string;
    bolts_spacing: string;
    bolts_spacing2: string;
    fix: string;
    et: string;
    dia: string;
    fixcode: string;
    cap: string;
    capR: string;
    auto: string;
    image: string;
    price: string;
    priceMRC: string;
    USN: string;
    stock: string;
    count: string;
    countUSN: string;
    count_rst: string;
    count_chl: string;
    count_nsb: string;
    cnt_mnf: string;
    onlyR: string;
}

export interface ISilkRim {
    code: string;
    brand: string;
    model_name: string;
    color: string;
    width: number;
    diameter: number;
    bolts_count: number;
    bolts_spacing: number;
    bolts_spacing2?: number;
    fix: string;
    et: number;
    dia: number;
    fixcode: string;
    cap: string;
    capR: string;
    auto: string;
    image: string;
    price: number;
    priceMRC: number;
    USN: boolean;
    count: number;
    countUSN: number;
    count_rst: number;
    count_chl: number;
    count_nsb: number;
    created_at?: Date;
    updated_at?: Date;
}
