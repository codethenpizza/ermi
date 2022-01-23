import {CalculateDiscountData} from "@core/services/order/discount/types";
import {IDiscount} from "@core/models/Discount.model";
import {Transaction} from "sequelize";

export abstract class Discount {
    abstract checkForDiscount(data: CalculateDiscountData, transaction?: Transaction): Promise<IDiscount | null>;
}
