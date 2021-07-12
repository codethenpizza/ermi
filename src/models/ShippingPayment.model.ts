import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import ShippingType from "@models/ShippingType.model";
import PaymentStrategy from "@models/PaymentStrategy.model";

@Table({
    tableName: 'shipping_payment',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ShippingPayment extends Model<ShippingPayment> {

    @ForeignKey(() => ShippingType)
    @Column
    shipping_type_id: number;

    @ForeignKey(() => PaymentStrategy)
    @Column
    payment_strategy_id: number;

}

export interface IShippingPayment {
    shipping_type_id: number;
    payment_strategy_id: number;
}
