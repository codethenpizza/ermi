import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'supplier_discovery',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class DiscoveryModel extends Model<IDiscovery> {

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    code: string;

    @Column({
        unique: true,
        allowNull: false,
    })
    artikul: string;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    name: string;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    brand: string;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    picture: string;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    model_name: string;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    price: number;

    @Column({
        allowNull: false,
        type: DataType.FLOAT
    })
    price_recommended: number;

    @Column({
        allowNull: false,
        type: DataType.FLOAT
    })
    rest_fast: number;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    color: string;


    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    color_name: string;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    type: string;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    pcd: string;

    @Column({
        allowNull: false,
        type: DataType.FLOAT
    })
    diameter: number;

    @Column({
        allowNull: false,
        type: DataType.FLOAT
    })
    dia: number;

    @Column({
        allowNull: false,
        type: DataType.FLOAT
    })
    et: number;

    @Column({
        allowNull: false,
        type: DataType.FLOAT
    })
    width: number;

    @Column({
        allowNull: false,
        type: DataType.FLOAT
    })
    bolts_count: number;

    @Column({
        allowNull: false,
        type: DataType.FLOAT
    })
    bolts_spacing: number;
}

export interface IDiscovery {
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
    pcd: string;
    diameter: number;
    dia: number;
    et: number;
    width: number;
    bolts_count: number;
    bolts_spacing: number;
}