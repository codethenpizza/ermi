import {CalculateDiscountData} from "@core/services/order/discount/types";
import {IDiscount} from "@core/models/Discount.model";
import {Discount} from "@core/services/order/discount/discounts/Discount";
import {Transaction} from "sequelize";

export class DiscountService {

    constructor(
        private discountStrategies: Discount[]
    ) {
    }

    async calculateDiscounts(data: CalculateDiscountData, transaction?: Transaction): Promise<IDiscount[]> {
        return (await Promise.all(
            this.discountStrategies.map(s => s.checkForDiscount(data, transaction))
        )).filter(x => !!x);
    }
}
