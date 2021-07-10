import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import Order from "@models/Order.model";

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

}
