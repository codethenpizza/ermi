import {ShippingStrategy} from "@core/services/order/shipping/strategies/ShippingStrategy";
import {CalculateShippingResult, ShippingStrategyData} from "@core/services/order/shipping/types";
import PickupPoint from "@models/PickupPoint.model";

export class LocalPickup implements ShippingStrategy {

    async calculate({orderProducts, address: {pickup_point_id}, shippingTypeId}: ShippingStrategyData): Promise<CalculateShippingResult[]> {

        if (!pickup_point_id) {
            return [];
        }

        // Check the availability of goods

        const pickupPoint = await PickupPoint.findByPk(pickup_point_id);

        return [
            {
                shipping: {
                    shipping_address_id: pickupPoint.address_id,
                    delivery_date_from: new Date(),
                    shipping_type_id: shippingTypeId,
                    cost: 0,
                    status: 'done' // Set done after manager check
                },
                orderProducts
            }
        ];
    }

}
