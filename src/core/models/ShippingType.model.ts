import {BelongsToMany, Column, DataType, Model, Table} from "sequelize-typescript";
import ShippingPayment from "@core/models/ShippingPayment.model";
import PaymentStrategy from "@core/models/PaymentStrategy.model";

@Table({
    tableName: 'shipping_type',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ShippingType extends Model<ShippingType> implements IShippingType {

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
    strategy: string;

    @Column({
        defaultValue: false
    })
    enabled: boolean;

    @BelongsToMany(() => PaymentStrategy, () => ShippingPayment)
    paymentStrategies: PaymentStrategy[];

}

export interface IShippingType {
    id?: number;
    name: string;
    desc: string;
    strategy: string;
    enabled?: boolean;
}
