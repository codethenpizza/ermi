import {ShippingStrategy} from "@core/services/order/shipping/strategies/ShippingStrategy";
import {ICalculateShippingResult, IShippingStrategyData} from "@core/services/order/shipping/types";
import {Transaction} from "sequelize";

export class Courier implements ShippingStrategy {

    static defaultCost = 500;

    async calculate(data: IShippingStrategyData, transaction?: Transaction): Promise<ICalculateShippingResult[]> {

        const {shippingType, orderProducts} = data;

        // Check the availability of goods

        // Calculate shipping cost
        const cost = Courier.defaultCost;

        // Calculate shipping date
        const dateFrom = new Date(Date.now() + 60 ** 3 * 24 * 2);
        const dateTo = new Date(Date.now() + 60 ** 3 * 24 * 3);

        return [
            {
                shipping: {
                    shipping_type_id: shippingType.id,
                    shippingType,
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
