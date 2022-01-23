import {BelongsToMany, Column, DataType, Model, Table} from "sequelize-typescript";
import ShippingType from "@core/models/ShippingType.model";
import ShippingPayment from "@core/models/ShippingPayment.model";

@Table({
    tableName: 'payment_strategy',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class PaymentStrategy extends Model<PaymentStrategy> implements IPaymentStrategy {

    @Column({
        allowNull: false,
        unique: true
    })
    name: string;

    @Column({
        allowNull: false,
        unique: true
    })
    strategy: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @Column({
        defaultValue: false
    })
    enabled: boolean;

    @BelongsToMany(() => ShippingType, () => ShippingPayment)
    shippingTypes: ShippingType[];

}

export interface IPaymentStrategy {
    name: string;
    strategy: string;
    desc: string;
    enabled?: boolean;
}
