import {BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table} from "sequelize-typescript";
import ShippingType from "@models/ShippingType.model";
import Order from "@models/Order.model";
import ShippingAddress from "@models/ShippingAddress.model";

@Table({
    tableName: 'shipping',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Shipping extends Model<Shipping> {

    @ForeignKey(() => ShippingType)
    @Column({
        allowNull: false,
    })
    shipping_type_id: number;

    @BelongsTo(() => ShippingType)
    shippingType: ShippingType;

    @ForeignKey(() => Order)
    @Column({
        allowNull: false,
    })
    order_id: number;

    @BelongsTo(() => Order)
    order: Order;

    @Column({
        type: DataType.DECIMAL,
        allowNull: false,
        defaultValue: 0
    })
    cost: number;

    @ForeignKey(() => ShippingAddress)
    @Column({
        allowNull: false,
    })
    shipping_address_id: number;
}
