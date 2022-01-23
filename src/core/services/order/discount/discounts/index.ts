import {FirstBuy} from "@core/services/order/discount/discounts/FirstBuy";
import {Discount} from "@core/services/order/discount/discounts/Discount";

export const discountStrategies: Discount[] = [
    new FirstBuy()
]
