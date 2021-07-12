import {CalculateDiscountData} from "@core/services/order/discount/types";
import {IDiscount} from "@models/Discount.model";
import {Discount} from "@core/services/order/discount/discounts/Discount";
import {FirstBuy} from "@core/services/order/discount/discounts/FirstBuy";

export class DiscountService {

    private discountStrategies: Discount[] = [
        new FirstBuy()
    ];

    async calculateDiscounts(data: CalculateDiscountData): Promise<IDiscount[]> {
        return (await Promise.all(
            this.discountStrategies.map(s => s.checkForDiscount(data))
        )).filter(x => !!x);
    }
}
