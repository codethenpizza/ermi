import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import Invoice from "@core/models/Invoice.model";
import {ToNumber} from "@core/helpers/decorators";

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

    @ToNumber
    @Column({
        allowNull: false,
        type: DataType.DECIMAL(10, 2)
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
