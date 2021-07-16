import {Op, Transaction} from "sequelize";
import {FullPrepayment} from "../src/core/services/order/payment/strategies/FullPrepayment";
import {TenPercPrepayment} from "../src/core/services/order/payment/strategies/TenPercPrepayment";
import PaymentStrategy, {IPaymentStrategy} from "../src/models/PaymentStrategy.model";
import ShippingType, {IShippingType} from "../src/models/ShippingType.model";
import {LocalPickup} from "../src/core/services/order/shipping/strategies/LocalPickup";
import {Courier} from "../src/core/services/order/shipping/strategies/Courier";
import ShippingPayment, {IShippingPayment} from "../src/models/ShippingPayment.model";
import PickupPoint, {IPickupPoint} from "../src/models/PickupPoint.model";
import Address, {IAddress} from "../src/models/Address.model";

const paymentStrategies: IPaymentStrategy[] = [
    {name: 'Полная предоплата', desc: 'Полная предоплата', strategy: FullPrepayment.name, enabled: true},
    {name: '10% предоплата', desc: '10% предоплата', strategy: TenPercPrepayment.name, enabled: true},
];

const shippingTypes: IShippingType[] = [
    {name: 'Самовывоз', desc: 'Самовывоз со склада', strategy: LocalPickup.name, enabled: true},
    {name: 'Курьер', desc: 'Курьер по москве и области', strategy: Courier.name, enabled: true},
];

const pickupPoints: (Partial<IPickupPoint> & {address: IAddress})[] = [
    {name: 'Склад 4WHEELS', desc: 'Склад 4WHEELS', address: {fields: 'Мытищи Олимпийский проспект 2к1'}}
]

export const up = async (transaction: Transaction) => {
    const pStrategies = await PaymentStrategy.bulkCreate(paymentStrategies, {transaction});

    const sTypes = await ShippingType.bulkCreate(shippingTypes, {transaction});

    const sPayments: IShippingPayment[] = sTypes.reduce((arr, type) => {
        pStrategies.forEach(x => {
            arr.push({
                payment_strategy_id: x.id,
                shipping_type_id: type.id
            } as IShippingPayment)
        })
        return arr;
    }, []);

    await ShippingPayment.bulkCreate(sPayments, {transaction});

    for (const point of pickupPoints) {
        const address = await Address.create(point.address, {transaction});

        await PickupPoint.create({...point, address_id: address.id}, {transaction});
    }
};

export const down = async (transaction: Transaction) => {
    await PaymentStrategy.destroy({
        where: {strategy: {[Op.in]: paymentStrategies.map(x => x.strategy)}},
        transaction,
        force: true
    });
    await ShippingType.destroy({
        where: {strategy: {[Op.in]: shippingTypes.map(x => x.strategy)}},
        transaction,
        force: true
    });

    await PickupPoint.destroy({
        where: {name: {[Op.in]: pickupPoints.map(x => x.name)}},
        transaction,
        force: true
    });
    await Address.destroy({
        where: {fields: {[Op.in]: pickupPoints.map(x => x.address.fields)}},
        transaction,
        force: true
    });
};
