// @ts-ignore
const {Op} = require("sequelize");
const {FullPrepayment} = require("@core/services/order/payment/strategies/FullPrepayment");
const {TenPercPrepayment} = require("@core/services/order/payment/strategies/TenPercPrepayment");
const PaymentStrategy = require("@core/models/PaymentStrategy.model").default;
const ShippingType = require("@core/models/ShippingType.model").default;
const {LocalPickup} = require("@core/services/order/shipping/strategies/LocalPickup");
const {Courier} = require("@core/services/order/shipping/strategies/Courier");
const ShippingPayment = require("@core/models/ShippingPayment.model").default;
const PickupPoint = require("@core/models/PickupPoint.model").default;
const Address = require("@core/models/Address.model").default;

const paymentStrategies = [
    {name: 'Полная предоплата', desc: 'Полная предоплата', strategy: FullPrepayment.name, enabled: true},
    {name: '10% предоплата', desc: '10% предоплата', strategy: TenPercPrepayment.name, enabled: true},
];

const shippingTypes = [
    {name: 'Самовывоз', desc: 'Самовывоз со склада', strategy: LocalPickup.name, enabled: true},
    {name: 'Курьер', desc: 'Курьер по москве и области', strategy: Courier.name, enabled: true},
];

const pickupPoints = [
    {name: 'Склад 4WHEELS', desc: 'Склад 4WHEELS', address: {fields: 'Мытищи Олимпийский проспект 2к1'}}
]

module.exports.up = async (transaction) => {
    const pStrategies = await PaymentStrategy.bulkCreate(paymentStrategies, {transaction});

    const sTypes = await ShippingType.bulkCreate(shippingTypes, {transaction});

    const sPayments = sTypes.reduce((arr, type) => {
        pStrategies.forEach(x => {
            arr.push({
                payment_strategy_id: x.id,
                shipping_type_id: type.id
            })
        })
        return arr;
    }, []);

    await ShippingPayment.bulkCreate(sPayments, {transaction});

    for (const point of pickupPoints) {
        const address = await Address.create(point.address, {transaction});

        await PickupPoint.create({...point, address_id: address.id}, {transaction});
    }
};

module.exports.down = async (transaction) => {
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
