import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'shipping_type',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ShippingType extends Model<ShippingType> {

    @Column({
        unique: true,
        allowNull: false,
    })
    name: string;


    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @Column({
        unique: true,
        allowNull: false,
    })
    strategy: string;

    @Column({
        defaultValue: true
    })
    enabled: boolean;

}
