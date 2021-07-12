import {ShippingStrategy} from "@core/services/order/shipping/strategies/ShippingStrategy";
import {CalculateShippingResult, ShippingStrategyData} from "@core/services/order/shipping/types";

export class Courier implements ShippingStrategy {

    async calculate({address, shippingTypeId, orderProducts}: ShippingStrategyData): Promise<CalculateShippingResult[]> {

        // Check the availability of goods

        // Calculate shipping cost
        const cost = 500;

        // Calculate shipping date
        const dateFrom = new Date(Date.now() + 60 ** 3 * 24 * 2);
        const dateTo = new Date(Date.now() + 60 ** 3 * 24 * 3);

        return [
            {
                shipping: {
                    shipping_type_id: shippingTypeId,
                    cost,
                    status: 'new',
                    delivery_date_from: dateFrom,
                    delivery_date_to: dateTo
                },
                orderProducts
            }
        ];
    }

}
