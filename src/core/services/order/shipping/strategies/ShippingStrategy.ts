import {ICalculateShippingResult, IShippingStrategyData} from "@core/services/order/shipping/types";
import {Transaction} from "sequelize";

export abstract class ShippingStrategy {
    abstract calculate(data: IShippingStrategyData, transaction?: Transaction): Promise<ICalculateShippingResult[]>
}
