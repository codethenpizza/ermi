import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import Address from "@models/Address.model";

@Table({
    tableName: 'pickup_point',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class PickupPoint extends Model<PickupPoint> {

    @Column({
        allowNull: false
    })
    name: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @ForeignKey(() => Address)
    @Column({
        allowNull: false
    })
    address_id: number;

    @BelongsTo(() => Address)
    address: Address;
}

export interface IPickupPoint {
    id?: number;
    name: string;
    desc: string;
    address_id: number;
}
