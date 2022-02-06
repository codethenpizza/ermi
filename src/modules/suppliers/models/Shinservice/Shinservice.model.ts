import {Column, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'supplier_shinservice',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ShinserviceModel extends Model<IShinserviceModel> {
    @Column({
        unique: true,
        allowNull: false,
        primaryKey: true,
    })
    id: string;

    @Column
    sku: string;

    @Column
    title: string;

    @Column
    gtin: string;

    @Column
    season: string;

    @Column
    brand: string;

    @Column
    model: string;

    @Column
    diam: string;

    @Column
    width: string;

    @Column
    profile: string;

    @Column
    load: string;

    @Column
    speed: string;

    @Column
    pin: string;

    @Column
    runflat: string;

    @Column
    prod_year: string;

    @Column
    sale: string;

    @Column
    price: string;

    @Column
    retail_price: string;

    @Column
    sticker_price: string;

    @Column
    photo: string;

    @Column
    stock: string;

    @Column
    local_stock: string;
}

export interface IShinserviceModel {
    id: string;
    sku: string;
    title: string;
    gtin: string;
    season: string;
    brand: string;
    model: string;
    diam: string;
    width: string;
    profile: string;
    load: string;
    speed: string;
    pin: string;
    runflat: string;
    prod_year: string;
    sale: string;
    price: string;
    retail_price: string;
    sticker_price: string;
    price_msrp: string;
    photo: string;
    stock: string;
    local_stock: string;
}
