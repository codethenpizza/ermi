import {ShippingStrategy} from "@core/services/order/shipping/strategies/ShippingStrategy";
import {ICalculateShippingResult, IShippingStrategyData} from "@core/services/order/shipping/types";
import PickupPoint from "@core/models/PickupPoint.model";
import {Transaction} from "sequelize";

export class LocalPickup implements ShippingStrategy {

    async calculate(
        {orderProducts, address: {pickup_point_id}, shippingType}: IShippingStrategyData,
        transaction?: Transaction
    ): Promise<ICalculateShippingResult[]> {

        if (!pickup_point_id) {
            return [];
        }

        // Check the availability of goods

        const pickupPoint = await PickupPoint.findByPk(pickup_point_id, {transaction});


        return [
            {
                shipping: {
                    address_id: pickupPoint.address_id,
                    delivery_date_from: new Date(),
                    shipping_type_id: shippingType.id,
                    shippingType,
                    cost: 0,
                    status: 'done' // TODO Set done after manager check
                },
                orderProducts
            }
        ];
    }

}
