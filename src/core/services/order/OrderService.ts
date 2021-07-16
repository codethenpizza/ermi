import Order, {IOrder} from "@models/Order.model";
import {
    CalculateOrderResult,
    CalculateOrderTotal,
    CreateOrderData,
    CreateOrderDataProduct,
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
import DiscountType from "@models/DiscountType.model";
import PaymentStrategy from "@models/PaymentStrategy.model";
import PickupPoint from "@models/PickupPoint.model";
import {AuthService, LoginObj} from "@core/services/AuthService";
import {randomString} from "@core/services/order/helpers";
import {SHIPPING_STRATEGY} from "@core/services/order/shipping/constants";

export class OrderService {

    constructor(
        private shippingService = new ShippingService(),
        private discountService = new DiscountService(),
        private paymentService = new PaymentService(),
    ) {
    }

    async create(data: CreateOrderData): Promise<Order> {
        const {shipping, discounts, total} = await this.calculateOrder(data);

        const transaction = await Order.sequelize.transaction();

        try {
            const {userID, newUserPassword} = await this.getUserId(data, transaction);

            // Create order entity
            const order = await Order.create({
                user_id: userID,
                payment_strategy_id: data.payment_strategy_id,
                total
            } as IOrder, {transaction})


            // Create discounts
            await Discount.bulkCreate(discounts.map(x => ({...x, order_id: order.id})), {transaction});


            let addressID: number = await this.getAddressID(data, userID, transaction);

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


            // Done!
            await transaction.commit();

            if (newUserPassword) {
                // TODO Send email with newUserPassword
                console.log('newUserPassword', newUserPassword);
            }

            return Order.findByPk(order.id, {
                include: Order.fullIncludes()
            });
        } catch (e) {
            await transaction.rollback();
            throw e;
        }

    }

    async calculateOrder(data: CreateOrderData): Promise<CalculateOrderResult> {
        const user = await User.findByPk(data.user_id);

        const orderProducts = await this.makeOrderProducts(data.productItems);

        const shipping = await this.shippingService.calculateShipping({
            shippingTypeId: data.shipping_type_id,
            address: data.address,
            orderProducts
        });

        const discounts = await this.discountService.calculateDiscounts({
            user,
            orderProducts,
            shipping,
            meta: data.meta,
        });

        const total = this.calculateTotal({shipping, discounts});

        return {
            shipping,
            discounts,
            total
        }
    }

    private async makeOrderProducts(productItems: CreateOrderDataProduct[]): Promise<IOrderProduct[]> {

        const productIds = productItems.map(x => x.product_variant_id);
        const productVariants = await ProductVariant.findAll({where: {id: {[Op.in]: productIds}}});

        const map = new Map<number, IOrderProduct>();

        productVariants.forEach(({id, price}) => {
            map.set(id, {
                product_variant_id: id,
                price,
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

    private async generateUser({email}: Partial<IUser>, transaction: Transaction): Promise<{ loginObj: LoginObj, password: string }> {
        const name = email.split('@')[0];
        const password = randomString(8);

        const loginObj = await AuthService.register({
            email,
            name,
            password
        }, transaction);

        return {
            loginObj,
            password
        }
    }

    private async getUserId(data: CreateOrderData, transaction: Transaction): Promise<{userID: number, newUserPassword: string}> {
        let userID: number;
        // - If user is new
        let newUserPassword: string;
        if (data.user_id) {
            userID = data.user_id;
        } else {
            const {password, loginObj} = await this.generateUser(data.userData, transaction);
            userID = loginObj.user.id;
            newUserPassword = password;
        }

        return {
            userID,
            newUserPassword
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
}
