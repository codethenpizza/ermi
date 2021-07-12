import Order, {IOrder} from "@models/Order.model";
import {
    CalculateOrderResult, CalculateOrderTotal,
    CreateOrderData,
    CreateOrderDataProduct,
} from "@core/services/order/types";
import ProductVariant from "@models/ProductVariant.model";
import {Op} from "sequelize";
import OrderProduct, {IOrderProduct} from "@models/OrderProduct.model";
import User from "@models/User.model";
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

export class OrderService {

    constructor(
        private shippingService = new ShippingService(),
        private discountService = new DiscountService(),
        private paymentService = new PaymentService()
    ) {
    }

    async create(data: CreateOrderData): Promise<Order> {
        const {shipping, discounts, total} = await this.calculateOrder(data);

        const transaction = await Order.sequelize.transaction();

        try {
            const order = await Order.create({
                user_id: data.user_id,
                payment_strategy_id: data.payment_strategy_id,
                total
            } as IOrder, {transaction})

            await Discount.bulkCreate(discounts.map(x => ({...x, order_id: order.id})), {transaction});

            let shippingAddressID = data.address.address_id;

            if (data.address.address) {
                const newAddress = await Address.create({...data.address.address}, {transaction});
                shippingAddressID = newAddress.id;

                await UserAddress.create({
                    user_id: data.user_id,
                    address_id: shippingAddressID
                } as IUserAddress, {transaction});
            } else if (data.address.pickup_point_id) {
                const pickupPoint = await PickupPoint.findByPk(data.address.pickup_point_id, {transaction});
                shippingAddressID = pickupPoint.address_id;
            }

            for (const {shipping: sh, orderProducts} of shipping) {
                const shItem = await Shipping.create({
                    ...sh,
                    order_id: order.id,
                    shipping_address_id: shippingAddressID,
                } as IShipping, {transaction});

                await OrderProduct.bulkCreate(orderProducts.map(x => ({
                    ...x,
                    order_id: order.id,
                    shipping_id: shItem.id
                })), {transaction});
            }

            const invoices: IInvoice[] = await this.paymentService.makeInvoices(total, data.payment_strategy_id);

            await Invoice.bulkCreate(invoices.map(x => ({
                ...x,
                order_id: order.id,
            })), {transaction});

            await transaction.commit();

            return Order.findByPk(order.id, {
                include: [
                    {model: Discount, include: [DiscountType]},
                    {model: Shipping, include: [ShippingType, Address]},
                    {model: OrderProduct, include: [ProductVariant]},
                    PaymentStrategy,
                    Invoice
                ]
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

}
