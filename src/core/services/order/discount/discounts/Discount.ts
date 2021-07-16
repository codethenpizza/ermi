import {CalculateDiscountData} from "@core/services/order/discount/types";
import {IDiscount} from "@models/Discount.model";

export abstract class Discount {
    abstract checkForDiscount(data: CalculateDiscountData): Promise<IDiscount | null>;
}
