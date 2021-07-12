import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Address from "@models/Address.model";

@Table({
    tableName: 'shipping_address',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class PickupPoint extends Model<PickupPoint> {

    @Column({
        allowNull: false
    })
    name: string;

    @Column({
        allowNull: false
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
