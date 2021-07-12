import {Op, Transaction} from "sequelize";
import {FullPrepayment} from "../src/core/services/order/payment/strategies/FullPrepayment";
import {TenPercPrepayment} from "../src/core/services/order/payment/strategies/TenPercPrepayment";
import PaymentStrategy, {IPaymentStrategy} from "../src/models/PaymentStrategy.model";
import ShippingType, {IShippingType} from "../src/models/ShippingType.model";
import {LocalPickup} from "../src/core/services/order/shipping/strategies/LocalPickup";
import {Courier} from "../src/core/services/order/shipping/strategies/Сourier";
import ShippingPayment, {IShippingPayment} from "../src/models/ShippingPayment.model";

const paymentStrategies: IPaymentStrategy[] = [
    {name: 'Полная предоплата', desc: 'Полная предоплата', strategy: FullPrepayment.name, enabled: true},
    {name: '10% предоплата', desc: '10% предоплата', strategy: TenPercPrepayment.name, enabled: true},
];

const shippingTypes: IShippingType[] = [
    {name: 'Самовывоз', desc: 'Самовывоз со склада', strategy: LocalPickup.name, enabled: true},
    {name: 'Курьер', desc: 'Курьер по москве и области', strategy: Courier.name, enabled: true},
];

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
};

export const down = async (transaction: Transaction) => {
    await PaymentStrategy.destroy({where: {strategy: {[Op.in]: paymentStrategies.map(x => x.strategy)}}, transaction});
    await ShippingType.destroy({where: {strategy: {[Op.in]: shippingTypes.map(x => x.strategy)}}, transaction});
};
