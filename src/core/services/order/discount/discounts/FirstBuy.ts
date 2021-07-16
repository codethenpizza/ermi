import {Discount} from "@core/services/order/discount/discounts/Discount";
import {IDiscount} from "@models/Discount.model";
import {CalculateDiscountData} from "@core/services/order/discount/types";
import Order from "@models/Order.model";
import DiscountType from "@models/DiscountType.model";

export class FirstBuy implements Discount {

    discountValue = 500;

    async checkForDiscount(data: CalculateDiscountData): Promise<IDiscount | null> {
        if (!data.user) {
            return null;
        }

        const userOrdersCount = await Order.count({where: {user_id: data.user.id}});

        if (userOrdersCount > 0) {
            return null;
        }

        const discountType = await DiscountType.findOne({where: {strategy: FirstBuy.name}});

        if (!discountType) {
            return null;
        }

        return {
            discount_type_id: discountType.id,
            value: this.discountValue
        }
    }
}
