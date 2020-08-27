import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'supplier_silk',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class SlikModel extends Model<ISilkRaw> {

    @Column
    code: string;

    @Column
    brand: string;

    @Column
    model: string;

    @Column
    color: string;

    @Column
    width: number;

    @Column
    diameter: number;

    @Column
    bolts_count: number;

    @Column
    bolts_spacing: number;

    @Column
    bolts_spacing2: number;

    @Column
    fix: string;

    @Column
    et: number;

    @Column
    dia: number;

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
    price: number;

    @Column
    priceMRC: number;

    @Column
    USN: number;

    @Column
    stock: string;

    @Column
    count: number;

    @Column
    countUSN: number;

    @Column
    count_rst: number;

    @Column
    count_chl: number;

    @Column
    count_nsb: number;
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
    count: string;
    countUSN: string;
    count_rst: string;
    count_chl: string;
    count_nsb: string;
}

export interface ISilkDisk {
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
