import {BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table} from "sequelize-typescript";
import Invoice from "@models/Invoice.model";
import PaymentType from "@models/PaymentStrategy.model";

@Table({
    tableName: 'payment_transaction',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class PaymentTransaction extends Model<PaymentTransaction> {

    @ForeignKey(() => Invoice)
    @Column({
        allowNull: false
    })
    invoice_id: number;

    @BelongsTo(() => Invoice)
    invoice: Invoice;

    @Column({
        allowNull: false,
        type: DataType.DECIMAL
    })
    value: number;

    @Column({
        type: DataType.TEXT,
    })
    desc: string;

    @Column({
        allowNull: false,
        defaultValue: 'done'
    })
    status: string;

}
