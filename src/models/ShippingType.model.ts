import {BelongsToMany, Column, DataType, Model, Table} from "sequelize-typescript";
import ShippingPayment from "@models/ShippingPayment.model";
import PaymentStrategy from "@models/PaymentStrategy.model";
import {SHIPPING_STRATEGY} from "@core/services/order/shipping/constants";

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
    strategy: SHIPPING_STRATEGY;

    @Column({
        defaultValue: false
    })
    enabled: boolean;

    @BelongsToMany(() => PaymentStrategy, () => ShippingPayment)
    paymentStrategies: PaymentStrategy[];

}

export interface IShippingType {
    name: string;
    desc: string;
    strategy: string;
    enabled?: boolean;
}
