import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import Order from "@models/Order.model";
import PaymentTransaction from "@models/PaymentTransaction.model";

@Table({
    tableName: 'invoice',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Invoice extends Model<Invoice> {

    @ForeignKey(() => Order)
    @Column({
        allowNull: false
    })
    order_id: number;

    @BelongsTo(() => Order)
    order: Order;

    @Column({
        allowNull: false,
        type: DataType.TEXT
    })
    desc: string;

    @Column({
        type: DataType.DECIMAL,
        allowNull: false
    })
    value: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    is_paid: boolean;

    @HasMany(() => PaymentTransaction)
    paymentTransactions: PaymentTransaction[];

}

export interface IInvoice {
    id?: number;
    order_id?: number;
    desc: string;
    value: number;
    is_paid?: boolean;
}
