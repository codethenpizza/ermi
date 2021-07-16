import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import User from "@models/User.model";
import OrderProduct from "@models/OrderProduct.model";
import ShippingType from "@models/ShippingType.model";
import Discount from "@models/Discount.model";
import Shipping from "@models/Shipping.model";
import Invoice from "@models/Invoice.model";
import PaymentStrategy from "@models/PaymentStrategy.model";
import {Includeable} from "sequelize";
import DiscountType from "@models/DiscountType.model";
import Address from "@models/Address.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import AttrType from "@models/AttrType.model";
import Image from "@models/Image.model";

@Table({
    tableName: 'order',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Order extends Model<Order> {

    @Column({
        // unique: true
    })
    uid: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
    user_id: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => PaymentStrategy)
    @Column({
        allowNull: false,
    })
    payment_strategy_id: number;

    @BelongsTo(() => PaymentStrategy)
    paymentStrategy: PaymentStrategy;

    // TODO set enum
    @Column({
        allowNull: false,
        defaultValue: 'new'
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

    static fullIncludes(): Includeable[] {
        return [
            {model: Discount, include: [DiscountType]},
            {model: Shipping, include: [ShippingType, Address, OrderProduct]},
            PaymentStrategy,
            Invoice
        ];
    }

}

export interface IOrder {
    id?: string;
    uid?: string;
    user_id: number;
    payment_strategy_id: number;
    status?: string;
    total: number;
}
