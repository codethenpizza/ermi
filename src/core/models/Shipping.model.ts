import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import ShippingType, {IShippingType} from "@core/models/ShippingType.model";
import Order from "@core/models/Order.model";
import Address from "@core/models/Address.model";
import OrderOffer, {IOrderOffer} from "@core/models/OrderOffer.model";
import {ToNumber} from "@core/helpers/decorators";

@Table({
    tableName: 'shipping',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Shipping extends Model<Shipping> implements IShipping {

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

    @ToNumber
    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    })
    cost: number;

    @ForeignKey(() => Address)
    @Column({
        allowNull: false,
    })
    address_id: number;

    @BelongsTo(() => Address)
    address: Address;

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

    @HasMany(() => OrderOffer)
    orderOffers: OrderOffer[];
}

export interface IShipping {
    id?: number;
    shipping_type_id: number;
    order_id?: number;
    cost: number;
    address_id: number;
    delivery_date_from: Date;
    delivery_date_to?: Date;
    status: string;
    shippingType?: IShippingType;
    orderOffers?: IOrderOffer[];
}
