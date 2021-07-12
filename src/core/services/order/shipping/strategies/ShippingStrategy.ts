import {CalculateShippingResult, ShippingStrategyData} from "@core/services/order/shipping/types";

export abstract class ShippingStrategy {
    abstract calculate(data: ShippingStrategyData): Promise<CalculateShippingResult[]>
}
