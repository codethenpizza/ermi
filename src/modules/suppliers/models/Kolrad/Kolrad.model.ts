import {Column, Model, Table} from "sequelize-typescript";
import {RimMap} from "../../productTypes/rim/rimTypes";

@Table({
    tableName: 'supplier_kolrad',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class KolradModel extends Model {

    @Column({
        unique: true,
        allowNull: false
    })
    vendorCode: string;

    @Column
    price: string;

    @Column
    currencyId: string;

    @Column
    categoryId: string;

    @Column
    picture: string;

    @Column
    name: string;

    @Column
    vendor: string;

    @Column
    sale: string;

    @Column({
        type: 'longText'
    })
    param: string;

    @Column
    discounted: string;

    @Column
    prices: string;

    @Column
    stocks: string;

    @Column({
        type: 'longText'
    })
    description: string;

}

export namespace IKolrad {
    export interface Raw {
        price: string
        currencyId: string
        categoryId: string
        picture: string
        name: string
        vendor: string
        vendorCode: string
        sale: string
        param: string
        discounted: string
        prices: string
        stocks: string
        description: string
    }

    export interface RawParam {
        '$': { 'name': string }
        '$text': string
    }

    export interface ParsedParams {
        diameter: number
        model: string
        color: string
        dia: number
        et: number
        width: number
        bolts_count: number
        bolts_spacing: number
        pcd: string
    }

    export enum RawParamNames {
        'D (размер обода)' = 'diameter',
        'Модель' = 'model',
        'Цвет' = 'color',
        'DIA' = 'dia',
        'ET' = 'et',
        'LZ (ширина обода)' = 'width',
        'PCD' = 'PCD'
    }

    export interface ParsedStock {
        'name': string
        'quantity': string
        '$': {
            'id': string
        }
    }

    export interface Rim extends RimMap {
        // empty interface
    }
}
