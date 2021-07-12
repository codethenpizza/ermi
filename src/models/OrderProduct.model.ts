import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import ProductVariant from "@models/ProductVariant.model";
import Order from "@models/Order.model";

@Table({
    tableName: 'order_product',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class OrderProduct extends Model<OrderProduct> {

    @ForeignKey(() => Order)
    @Column({
        allowNull: false
    })
    order_id: number;

    @BelongsTo(() => Order)
    order: Order;

    @ForeignKey(() => ProductVariant)
    @Column({
        allowNull: false
    })
    product_variant_id: number;

    @BelongsTo(() => ProductVariant)
    productVariant: ProductVariant;

    @Column({
        allowNull: false,
        type: DataType.DECIMAL
    })
    price: number;

    @Column({
        allowNull: false
    })
    qty: number;

}

export interface IOrderProduct {
    id?: number;
    order_id?: number;
    product_variant_id: number;
    price: number;
    qty: number;
    shipping_id?: number;
}
