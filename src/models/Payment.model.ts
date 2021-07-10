import {BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table} from "sequelize-typescript";
import Invoice from "@models/Invoice.model";
import PaymentMethod from "@models/PaymentMethod.model";

@Table({
    tableName: 'payment',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Payment extends Model<Payment> {

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

    @ForeignKey(() => PaymentMethod)
    @Column({
        allowNull: false
    })
    payment_method_id: number;

    @BelongsTo(() => PaymentMethod)
    paymentMethod: PaymentMethod;

}
