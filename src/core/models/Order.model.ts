import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import User, {IUser} from "@core/models/User.model";
import OrderOffer, {IOrderOffer} from "@core/models/OrderOffer.model";
import ShippingType from "@core/models/ShippingType.model";
import Discount, {IDiscount} from "@core/models/Discount.model";
import Shipping, {IShipping} from "@core/models/Shipping.model";
import Invoice, {IInvoice} from "@core/models/Invoice.model";
import PaymentStrategy, {IPaymentStrategy} from "@core/models/PaymentStrategy.model";
import {Includeable} from "sequelize";
import DiscountType from "@core/models/DiscountType.model";
import Address from "@core/models/Address.model";
import B2BDiscount, {IB2BDiscount} from "@core/models/B2BDiscount.model";
import {OrderStatus} from "@core/useCases/OrderUseCases/constants";
import Offer from "@core/models/Offer.model";
import {ToNumber} from "@core/helpers/decorators";

@Table({
    tableName: 'order',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Order extends Model<Order> implements IOrder {

    id: number;

    @Column({
        unique: true
    })
    uid: string;

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
    user_id: number;

    @ForeignKey(() => PaymentStrategy)
    @Column({
        allowNull: false,
    })
    payment_strategy_id: number;

    @ForeignKey(() => B2BDiscount)
    @Column
    b2b_discount_id: number;

    @Column({
        allowNull: false,
        defaultValue: OrderStatus.New
    })
    status: OrderStatus;

    @ToNumber
    @Column({
        allowNull: false,
        type: DataType.DECIMAL(10, 2),
        defaultValue: 0
    })
    total: number;


    @BelongsTo(() => User)
    user: User;

    @BelongsTo(() => PaymentStrategy)
    paymentStrategy: PaymentStrategy;

    @BelongsTo(() => B2BDiscount)
    B2BDiscount: B2BDiscount;

    @HasMany(() => OrderOffer)
    offers: OrderOffer[];

    @HasMany(() => Discount)
    discounts: Discount[];

    @HasMany(() => Shipping)
    shipping: Shipping[];

    @HasMany(() => Invoice)
    invoices: Invoice[];

    static getFullIncludes(): Includeable[] {
        return [
            {model: Discount, include: [DiscountType]},
            {model: Shipping, include: [ShippingType, Address, OrderOffer]},
            PaymentStrategy,
            Invoice,
            B2BDiscount,
            {model: OrderOffer, include: [Offer]}
        ];
    }

}


export interface IOrder {
    id: number;
    uid: string;
    user_id: number;
    payment_strategy_id: number;
    b2b_discount_id?: number;
    status: OrderStatus;
    total: number;
    user?: IUser;
    paymentStrategy?: IPaymentStrategy;
    B2BDiscount?: IB2BDiscount;
    offers?: IOrderOffer[];
    discounts?: IDiscount[];
    shipping?: IShipping[];
    invoices?: IInvoice[];
}
