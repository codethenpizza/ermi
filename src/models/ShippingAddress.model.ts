import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import User from "@models/User.model";

@Table({
    tableName: 'shipping_address',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ShippingAddress extends Model<ShippingAddress> {

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
    user_id: number;

    @BelongsTo(() => User)
    user: User;
}
