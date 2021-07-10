import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import User from "@models/User.model";
import OrderProduct from "@models/OrderProduct.model";
import ShippingType from "@models/ShippingType.model";
import Discount from "@models/Discount.model";
import Shipping from "@models/Shipping.model";
import Invoice from "@models/Invoice.model";

@Table({
    tableName: 'order',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Order extends Model<Order> {

    @Column({
        allowNull: false,
        unique: true
    })
    uid: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
    user_id: number;

    @BelongsTo(() => User)
    user: User;

    // TODO set enum
    @Column({
        allowNull: false,
    })
    status: string;

    @Column({
        allowNull: false,
        type: DataType.DECIMAL,
        defaultValue: 0
    })
    total: number;

    @HasMany(() => OrderProduct)
    products: OrderProduct[];

    @HasMany(() => Discount)
    discounts: Discount[];

    @HasMany(() => Shipping)
    shipping: Shipping[];

    @HasMany(() => Invoice)
    invoices: Invoice[];

}
