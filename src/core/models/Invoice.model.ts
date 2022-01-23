import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import Order from "@core/models/Order.model";
import PaymentTransaction from "@core/models/PaymentTransaction.model";
import {ToNumber} from "@core/helpers/decorators";

@Table({
    tableName: 'invoice',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Invoice extends Model<Invoice> implements IInvoice {

    id: number;

    @ForeignKey(() => Order)
    @Column({
        allowNull: false
    })
    order_id: number;

    @BelongsTo(() => Order)
    order: Order;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @ToNumber
    @Column({
        type: DataType.DECIMAL(10, 2),
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
    id: number;
    order_id: number;
    value: number;
    desc?: string;
    is_paid?: boolean;
}

export interface IInvoiceCreate extends Omit<IInvoice, 'id'> {
}
