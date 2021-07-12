import {BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table} from "sequelize-typescript";
import ShippingType from "@models/ShippingType.model";
import Order from "@models/Order.model";
import UserAddress from "@models/UserAddress.model";
import Address from "@models/Address.model";

@Table({
    tableName: 'shipping',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Shipping extends Model<Shipping> {

    @ForeignKey(() => ShippingType)
    @Column({
        allowNull: false,
    })
    shipping_type_id: number;

    @BelongsTo(() => ShippingType)
    shippingType: ShippingType;

    @ForeignKey(() => Order)
    @Column({
        allowNull: false,
    })
    order_id: number;

    @BelongsTo(() => Order)
    order: Order;

    @Column({
        type: DataType.DECIMAL,
        allowNull: false,
        defaultValue: 0
    })
    cost: number;

    @ForeignKey(() => Address)
    @Column({
        allowNull: false,
    })
    shipping_address_id: number;

    @BelongsTo(() => Address)
    shippingAddress: Address;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    delivery_date_from: Date;

    @Column({
        type: DataType.DATE,
    })
    delivery_date_to: Date;

    @Column({
        allowNull: false
    })
    status: string;
}

export interface IShipping {
    id?: number;
    shipping_type_id: number;
    order_id?: number;
    cost: number;
    shipping_address_id: number;
    delivery_date_from: Date;
    delivery_date_to?: Date;
    status: string;
}
