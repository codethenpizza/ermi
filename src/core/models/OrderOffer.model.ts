import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import Order from "@core/models/Order.model";
import Shipping from "@core/models/Shipping.model";
import Offer, {IOffer} from "@core/models/Offer.model";
import {ToNumber} from "@core/helpers/decorators";

@Table({
    tableName: 'order_offer',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class OrderOffer extends Model<OrderOffer> implements IOrderOffer {

    id: number;

    @ForeignKey(() => Order)
    @Column({
        allowNull: false
    })
    order_id: number;

    @BelongsTo(() => Order)
    order: Order;

    @ForeignKey(() => Offer)
    @Column({
        allowNull: false
    })
    offer_id: number;

    @BelongsTo(() => Offer)
    offer: Offer;

    @ToNumber
    @Column({
        allowNull: false,
        type: DataType.DECIMAL(10, 2)
    })
    price: number;

    @Column({
        allowNull: false
    })
    qty: number;

    @ForeignKey(() => Shipping)
    @Column({
        allowNull: false
    })
    shipping_id: number;

}

export interface IOrderOffer {
    id: number;
    order_id: number;
    offer_id: number;
    price: number;
    qty: number;
    shipping_id?: number;
    offer?: IOffer;
}

export interface IOrderOfferCreate extends Omit<IOrderOffer, 'id'> {
}

export interface IOrderOfferCalculate extends Omit<IOrderOfferCreate, 'order_id'> {
}
