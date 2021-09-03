import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Order from "@models/Order.model";
import DiscountType from "@models/DiscountType.model";

@Table({
    tableName: 'discount',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Discount extends Model<Discount> {

    @ForeignKey(() => Order)
    @Column({
        allowNull: false
    })
    order_id: number;

    @BelongsTo(() => Order)
    order: Order;

    @ForeignKey(() => DiscountType)
    @Column({
        allowNull: false
    })
    discount_type_id: number;

    @BelongsTo(() => DiscountType)
    discountType: DiscountType;

    @Column({
        defaultValue: 0,
        allowNull: false
    })
    value: number;

}

export interface IDiscount {
    id?: number;
    order_id?: number;
    discount_type_id: number;
    value: number;
}
