import Order, {IOrder} from "@models/Order.model";
import {
    CalculateOrderResult,
    CalculateOrderTotal,
    CreateOrderData,
    CreateOrderDataProduct,
    OrderResp,
} from "@core/services/order/types";
import ProductVariant from "@models/ProductVariant.model";
import {Op, Transaction} from "sequelize";
import OrderProduct, {IOrderProduct} from "@models/OrderProduct.model";
import User, {IUser} from "@models/User.model";
import UserAddress, {IUserAddress} from "@models/UserAddress.model";
import Shipping, {IShipping} from "@models/Shipping.model";
import ShippingType from "@models/ShippingType.model";
import {ShippingService} from "@core/services/order/shipping/ShippingService";
import {DiscountService} from "@core/services/order/discount/DiscountService";
import Discount from "@models/Discount.model";
import Invoice, {IInvoice} from "@models/Invoice.model";
import {PaymentService} from "@core/services/order/payment/PaymentService";
import Address from "@models/Address.model";
import PickupPoint from "@models/PickupPoint.model";
import {AuthService, LoginObj} from "@core/services/AuthService";
import {randomString} from "@core/services/order/helpers";
import {SHIPPING_STRATEGY} from "@core/services/order/shipping/constants";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import AttrValue from "@models/AttrValue.model";
import B2BDiscountGroup from "@models/B2BDiscountGroup.model";
import {EsProduct} from "@server/elastic/EsProducts";
import {EsProductVariant, EsRespProduct} from "@actions/front/types";
import {NotificationService} from "@core/services/notification/NotificationService";
import {MailData} from "@core/services/notification/types";

export class OrderService {

    constructor(
        private shippingService = new ShippingService(),
        private discountService = new DiscountService(),
        private paymentService = new PaymentService(),
        private notificationService = new NotificationService()
    ) {
    }

    async create(data: CreateOrderData, transaction?: Transaction): Promise<OrderResp> {
        const shouldGenerateUser = !data.user_id;

        if (shouldGenerateUser) {
            return this.createForNewUser(data, transaction);
        }

        const user = await User.findByPk(data.user_id, {transaction});

        if (user.b2b_discount_group_id) {
            return this.createForB2BUser(data, user, transaction);
        }

        return this.createForUser(data, user, transaction);
    }

    async calculateOrder(data: CreateOrderData): Promise<CalculateOrderResult> {
        const user = await User.findByPk(data.user_id, {
            include: [B2BDiscountGroup]
        });

        const isB2BUser = !!user?.b2b_discount_group_id;

        const orderProducts = await this.makeOrderProducts(data.productItems, isB2BUser ? user : null);

        const shipping = await this.shippingService.calculateShipping({
            shippingTypeId: data.shipping_type_id,
            address: data.address,
            orderProducts
        });

        const discounts = isB2BUser ? [] : await this.discountService.calculateDiscounts({
            user,
            orderProducts,
            shipping,
            meta: data.meta,
        });

        const total = this.calculateTotal({shipping, discounts});

        return {
            shipping,
            discounts,
            total,
            b2b_discount_id: isB2BUser ? user.b2bDiscountGroup.b2b_discount_id : null
        }
    }

    async getOrder(id: number, transaction?: Transaction): Promise<OrderResp> {
        const order = await Order.findByPk(id, {
            include: Order.fullIncludes(),
            transaction
        });

        const esOrderProducts = await this.getOrderEsProductVariants(order);

        return {
            order,
            esOrderProducts
        };
    }

    async getUserOrders(user: IUser, transaction?: Transaction): Promise<OrderResp[]> {
        const orders = await Order.findAll({
            where: {user_id: user.id},
            include: Order.fullIncludes(),
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

    private async createForUser(data: CreateOrderData, user: User, transaction?: Transaction): Promise<OrderResp> {
        const {shipping, discounts, total} = await this.calculateOrder(data);

        // Create order entity
        let order = await Order.create({
            user_id: user.id,
            payment_strategy_id: data.payment_strategy_id,
            total,
        } as IOrder, {transaction});


        // Create discounts
        await Discount.bulkCreate(discounts.map(x => ({...x, order_id: order.id})), {transaction});


        const addressID = await this.getAddressID(data, user.id, transaction);

        // Create shipping stuff
        for (const {shipping: sh, orderProducts} of shipping) {
            const shItem = await Shipping.create({
                ...sh,
                order_id: order.id,
                address_id: addressID,
            } as IShipping, {transaction});

            await OrderProduct.bulkCreate(orderProducts.map(x => ({
                ...x,
                order_id: order.id,
                shipping_id: shItem.id
            })), {transaction});
        }

        // Generate invoices
        const invoices = await this.paymentService.makeInvoices(total, data.payment_strategy_id);
        await Invoice.bulkCreate(invoices.map(x => ({
            ...x,
            order_id: order.id,
        })), {transaction});

        return this.getOrder(order.id, transaction);
    }

    private async createForNewUser(data: CreateOrderData, transaction?: Transaction): Promise<OrderResp> {
        const {password, loginObj} = await this.generateUser(data.userData, transaction);

        const user = await User.findByPk(loginObj.user.id, {transaction});

        const order = await this.createForUser(data, user, transaction);

        await this.sendPassForNewUser(user, password, transaction);

        return order;
    }

    private async createForB2BUser(data: CreateOrderData, user: User, transaction?: Transaction): Promise<OrderResp> {
        const {shipping, discounts, total, b2b_discount_id} = await this.calculateOrder(data);

        // Create order entity
        let order = await Order.create({
            user_id: user.id,
            payment_strategy_id: data.payment_strategy_id,
            total,
            b2b_discount_id
        } as IOrder, {transaction});

        let addressID: number = await this.getAddressID(data, user.id, transaction);

        // Create shipping stuff
        for (const {shipping: sh, orderProducts} of shipping) {
            const shItem = await Shipping.create({
                ...sh,
                order_id: order.id,
                address_id: addressID,
            } as IShipping, {transaction});

            await OrderProduct.bulkCreate(orderProducts.map(x => ({
                ...x,
                order_id: order.id,
                shipping_id: shItem.id
            })), {transaction});
        }

        // Generate invoices
        const invoices: IInvoice[] = await this.paymentService.makeInvoices(total, data.payment_strategy_id);
        await Invoice.bulkCreate(invoices.map(x => ({
            ...x,
            order_id: order.id,
        })), {transaction});


        return this.getOrder(order.id, transaction);
    }

    private async makeOrderProducts(productItems: CreateOrderDataProduct[], user?: User): Promise<IOrderProduct[]> {

        const productIds = productItems.map(x => x.product_variant_id);
        let productVariants = await ProductVariant.findAll({
            where: {id: {[Op.in]: productIds}},
            include: [AttrValue]
        });

        const map = new Map<number, IOrderProduct>();

        if (user) {
            productVariants = await B2BDiscountService
                .enrichProductByB2BUserDiscount(user, productVariants) as ProductVariant[];
        }

        productVariants.forEach(({id, price, price_discount}) => {
            map.set(id, {
                product_variant_id: id,
                price: price_discount || price,
                qty: 0
            });
        });

        // Set qty
        productItems.forEach(({product_variant_id: id, qty}) => {
            const orderProduct = map.get(id);
            map.set(id, {...orderProduct, qty});
        });

        return Array.from(map.values());
    }

    private calculateTotal({shipping, discounts}: CalculateOrderTotal): number {
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

        const loginObj = await AuthService.register({
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

    private async getAddressID(data: CreateOrderData, userID: number, transaction: Transaction): Promise<number> {
        const shippingType = await ShippingType.findByPk(data.shipping_type_id);

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

    private async getOrderEsProductVariants(order: Order): Promise<EsProductVariant[]> {
        const esProduct = new EsProduct();
        const resp = await esProduct.findByIds(order.products.map(x => x.product_variant_id));
        const body: EsRespProduct = resp.body as EsRespProduct;

        let products: EsProductVariant[] = body.hits.hits
            .map<EsProductVariant>((item) => item._source);

        if (order.b2b_discount_id) {
            products = await B2BDiscountService.enrichESProductByB2BDiscount(order.B2BDiscount, products) as EsProductVariant[];
        }

        return products;
    }

    private async sendPassForNewUser(user: User, password: string, transaction?: Transaction): Promise<boolean> {
        const data: MailData = {
            subject: 'Регистрация заказа - пароль',
            body: `Пароль от пользователя ${user.name} "${password}". Сменить пароль можно в личном кабинете`
        };

        return this.notificationService.sendMail(user.id, data, transaction);
    }
}
