import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'supplier_discovery',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class DiscoveryModel extends Model<IDiscoveryRaw> {

    @Column({
        unique: true,
        allowNull: false
    })
    code: string;

    @Column({})
    artikul: string;

    @Column({})
    name: string;

    @Column({})
    brand: string;

    @Column({
        type: DataType.TEXT
    })
    picture: string;

    @Column({})
    model_name: string;

    @Column({})
    price: string;

    @Column({})
    price_recommended: string;

    @Column({})
    rest_fast: string;

    @Column({})
    rest_middle: string;

    @Column({
        type: DataType.JSON
    })
    param: string;

}

//raw data
export interface IDiscoveryRaw {
    code: string;
    artikul: string;
    name: string;
    brand: string;
    picture: string;
    model: string;
    price: string;
    price_recommended: string;
    rest_fast: string;
    rest_middle: string;
    param: string;
}


// formatted data
export interface IDiscoveryDisk {
    code: string;
    artikul: string;
    name: string;
    brand: string;
    picture: string;
    model_name: string,
    price: number;
    price_recommended: number;
    rest_fast: number;
    color: string;
    color_name: string;
    type: string;
    pcd: number;
    diameter: number;
    dia: number;
    et: number;
    width: number;
    bolts_count: number;
    bolts_spacing: number;
}
