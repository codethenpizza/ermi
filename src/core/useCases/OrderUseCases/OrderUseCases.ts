import {NotificationService} from "@core/services/notification/NotificationService";
import {ShippingService} from "@core/services/order/shipping/ShippingService";
import {DiscountService} from "@core/services/order/discount/DiscountService";
import {PaymentService} from "@core/services/order/payment/PaymentService";
import {
    ICalculateOrderResult,
    ICalculateOrderTotal,
    ICreateOrderData,
    ICreateOrderDataProduct,
    IOrderResp
} from "@core/services/order/types";
import {Op, Transaction} from "sequelize";
import User, {IUser} from "@core/models/User.model";
import B2BDiscountGroup from "@core/models/B2BDiscountGroup.model";
import Order, {IOrder} from "@core/models/Order.model";
import Discount from "@core/models/Discount.model";
import Shipping, {IShipping} from "@core/models/Shipping.model";
import OrderOffer, {IOrderOffer, IOrderOfferCalculate} from "@core/models/OrderOffer.model";
import Invoice, {IInvoice, IInvoiceCreate} from "@core/models/Invoice.model";
import ProductVariant from "@core/models/ProductVariant.model";
import AttrValue from "@core/models/AttrValue.model";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import {LoginObj} from "@core/services/auth/types";
import {randomString} from "@core/services/order/helpers";
import {AuthService} from "@core/services/auth/AuthService";
import ShippingType from "@core/models/ShippingType.model";
import {SHIPPING_STRATEGY} from "@core/services/order/shipping/constants";
import Address from "@core/models/Address.model";
import UserAddress, {IUserAddress} from "@core/models/UserAddress.model";
import PickupPoint from "@core/models/PickupPoint.model";
import {MailData} from "@core/services/notification/types";
import {ElasticProductService} from "@core/services/elastic/ElasticProductService/ElasticProductService";
import Offer, {IOffer} from "@core/models/Offer.model";
import {OfferPriorityService} from "@core/services/catalog/OfferPriorityService";
import {Elastic} from "@core/services/elastic/types";
import {IInvoiceCalc} from "@core/services/order/payment/types";
import {ICalculateShippingResult} from "@core/services/order/shipping/types";

export class OrderUseCases {

    constructor(
        private notificationService: NotificationService,
        private shippingService: ShippingService,
        private discountService: DiscountService,
        private b2bDiscountService: B2BDiscountService,
        private paymentService: PaymentService,
        private esProductService: ElasticProductService,
        private authService: AuthService,
        private offerPriorityService: OfferPriorityService
    ) {
    }

    async create(data: ICreateOrderData, transaction?: Transaction): Promise<IOrderResp> {
        const shouldGenerateUser = !data.user_id;

        if (shouldGenerateUser) {
            return this.createForNewUser(data, transaction);
        }

        const user = await User.findByPk(data.user_id, {transaction});

        const isB2BUser = Boolean(user.b2b_discount_group_id);

        if (isB2BUser) {
            return this.createForB2BUser(data, user, transaction);
        }

        return this.createForUser(data, user, transaction);
    }

    async calculate(data: ICreateOrderData, transaction?: Transaction): Promise<ICalculateOrderResult> {
        const user = await User.findByPk(data.user_id, {
            include: [B2BDiscountGroup],
            transaction
        });

        const isB2BUser = Boolean(user?.b2b_discount_group_id);

        const orderProducts = await this.makeOrderProducts(data.productItems, isB2BUser ? user : null, transaction);

        const shipping = await this.shippingService.calculateShipping({
            shippingTypeId: data.shipping_type_id,
            address: data.address,
            orderProducts
        }, transaction);

        const discounts = isB2BUser ? [] : await this.discountService.calculateDiscounts({
            user,
            orderProducts,
            shipping,
            meta: data.meta,
        }, transaction);

        const total = this.calculateTotal({shipping, discounts});

        return {
            shipping,
            discounts,
            total,
            b2b_discount_id: isB2BUser ? user.b2bDiscountGroup.b2b_discount_id : null
        }
    }

    async get(id: number, transaction?: Transaction): Promise<IOrderResp> {
        const order = await Order.findByPk(id, {
            include: Order.getFullIncludes(),
            transaction
        }).then(x => x.toJSON() as IOrder);

        const esOrderProducts = await this.getOrderEsProductVariants(order);

        return {
            order,
            esOrderProducts
        };
    }

    async getUserOrders(user: IUser, transaction?: Transaction): Promise<IOrderResp[]> {
        const orders = await Order.findAll({
            where: {user_id: user.id},
            include: Order.getFullIncludes(),
            order: [['id', 'DESC']],
            transaction
        });

        return Promise.all(orders.map(async order => {
            const esOrderProducts = await this.getOrderEsProductVariants(order);
            return {
                order,
                esOrderProducts
            };
        }))
    }

    private async createForUser(data: ICreateOrderData, user: User, transaction?: Transaction): Promise<IOrderResp> {
        const {shipping, discounts, total} = await this.calculate(data, transaction);

        const order = await Order.create({
            user_id: user.id,
            payment_strategy_id: data.payment_strategy_id,
            total,
        } as IOrder, {transaction})
            .then(x => x.toJSON() as IOrder);

        // Create discounts
        await Discount.bulkCreate(discounts.map(x => ({...x, order_id: order.id})), {transaction});

        const addressID = await this.getAddressID(data, user.id, transaction);

        await this.createShippingItems(shipping, order.id, addressID, transaction);

        // TODO do we need this variable??
        const inv = await this.createInvoices(total, data.payment_strategy_id, order.id, transaction);

        return this.get(order.id, transaction);
    }

    private async createForNewUser(data: ICreateOrderData, transaction?: Transaction): Promise<IOrderResp> {
        const {password, loginObj} = await this.generateUser(data.userData, transaction);

        const user = await User.findByPk(loginObj.user.id, {transaction});

        const order = await this.createForUser(data, user, transaction);

        await this.sendPassForNewUser(user, password, transaction);

        return order;
    }

    private async createForB2BUser(data: ICreateOrderData, user: User, transaction?: Transaction): Promise<IOrderResp> {
        const {shipping, total, b2b_discount_id} = await this.calculate(data, transaction);

        const order = await Order.create({
            user_id: user.id,
            payment_strategy_id: data.payment_strategy_id,
            total,
            b2b_discount_id
        } as IOrder, {transaction})
            .then(x => x.toJSON() as IOrder);

        let addressID: number = await this.getAddressID(data, user.id, transaction);

        await this.createShippingItems(shipping, order.id, addressID, transaction);

        await this.createInvoices(total, data.payment_strategy_id, order.id, transaction);

        return this.get(order.id, transaction);
    }

    private async createShippingItems(
        shipping: ICalculateShippingResult[],
        orderID: IOrder['id'],
        addressID: IShipping['address_id'],
        transaction?: Transaction
    ): Promise<IShipping[]> {

        const resp: IShipping[] = [];

        for (const {shipping: sh, orderProducts} of shipping) {
            const shItem = await Shipping.create({
                ...sh,
                order_id: orderID,
                address_id: addressID,
            } as IShipping, {transaction})
                .then(x => x.toJSON() as IShipping);

            shItem.orderOffers = await OrderOffer.bulkCreate(orderProducts.map(x => ({
                ...x,
                order_id: orderID,
                shipping_id: shItem.id
            })), {transaction})
                .then(x => x.map(o => o.toJSON() as IOrderOffer));

            resp.push(shItem);
        }

        return resp;
    }

    private async createInvoices(
        total: number,
        paymentStrategyID: ICreateOrderData['payment_strategy_id'],
        orderID: IOrder['id'],
        transaction?: Transaction
    ): Promise<IInvoice[]> {
        const invoices: IInvoiceCalc[] = await this.paymentService.makeInvoices(total, paymentStrategyID);
        return Invoice.bulkCreate(invoices.map<IInvoiceCreate>(x => ({
            ...x,
            order_id: orderID,
        })), {transaction})
            .then(x => x.map(i => i.toJSON() as IInvoice));
    }

    private async makeOrderProducts(productItems: ICreateOrderDataProduct[], user?: User, transaction?: Transaction): Promise<IOrderOfferCalculate[]> {

        const offerIds = productItems.map(x => x.offer_id);
        let offers = await Offer.findAll({
            where: {id: {[Op.in]: offerIds}},
            include: [{model: ProductVariant, include: [AttrValue]}],
            transaction
        }).then(x => x.map(o => o.toJSON() as IOffer));


        if (user) {
            offers = await this.b2bDiscountService.enrichOfferByB2BUserDiscount(user, offers, transaction) as IOffer[];
        }

        const offersMap = new Map<number, IOffer>();
        offers.forEach((offer) => {
            offersMap.set(offer.id, offer);
        });


        return productItems.map<IOrderOfferCalculate>(({offer_id, qty}) => {
            const offer = offersMap.get(offer_id);
            return {
                offer_id,
                qty,
                price: offer.discount_price || offer.price,
            }
        });
    }

    private calculateTotal({shipping, discounts}: ICalculateOrderTotal): number {
        const shippingAndProductsTotal = shipping.reduce((acc, item) => {

            return acc +
                item.shipping.cost +
                item.orderProducts
                    .reduce((acc, {price, qty}) => acc += price * qty, 0);
        }, 0);
        const discountsTotal = discounts.reduce((acc, {value}) => acc += value, 0);
        return shippingAndProductsTotal - discountsTotal;
    }

    private async generateUser(
        {
            email,
            name,
            phone
        }: Partial<IUser>, transaction: Transaction): Promise<{ loginObj: LoginObj, password: string }> {
        const userName = name || email.split('@')[0];
        const password = randomString(8);

        const loginObj = await this.authService.register({
            email,
            name: userName,
            password,
            phone
        }, transaction);

        return {
            loginObj,
            password
        }
    }

    private async getAddressID(data: ICreateOrderData, userID: number, transaction: Transaction): Promise<number> {
        const shippingType = await ShippingType.findByPk(data.shipping_type_id, {transaction});

        switch (shippingType.strategy) {
            case SHIPPING_STRATEGY.Courier:
                if (data.address.address_id) {
                    return data.address.address_id;
                } else if (data.address.address) {
                    const newAddress = await Address.create(data.address.address, {transaction});

                    await UserAddress.create({
                        user_id: userID,
                        address_id: newAddress.id
                    } as IUserAddress, {transaction});

                    return newAddress.id;
                } else {
                    throw new Error('address_id or address is required');
                }

            case SHIPPING_STRATEGY.LocalPickup:
                if (data.address.pickup_point_id) {
                    const pickupPoint = await PickupPoint.findByPk(data.address.pickup_point_id, {transaction});
                    if (!pickupPoint) {
                        throw new Error('Wrong pickup_point_id');
                    }

                    return pickupPoint.address_id;
                } else {
                    throw new Error('pickup_point_id is required');
                }

            default:
                throw new Error('Wrong shipping type strategy');
        }
    }

    private async getOrderEsProductVariants(order: IOrder): Promise<Elastic.ProductVariantFormatted[]> {
        const products = await this.esProductService.findByIds(order.offers.map(x => x.offer.product_variant_id), true);

        let productOffer: Elastic.ProductVariantFormatted[] = await Promise.all(products.map(x => this.offerPriorityService.chooseOffer(x)));

        if (order.b2b_discount_id) {
            productOffer = await this.b2bDiscountService.enrichESProductByB2BDiscount(order.B2BDiscount, productOffer) as Elastic.ProductVariantFormatted[];
        }

        return productOffer;
    }

    private async sendPassForNewUser(user: User, password: string, transaction?: Transaction): Promise<boolean> {
        const data: MailData = {
            subject: 'Регистрация заказа - пароль',
            body: `Пароль от пользователя ${user.name} "${password}". Сменить пароль можно в личном кабинете`
        };

        return this.notificationService.sendMail(user.id, data, transaction);
    }
}
