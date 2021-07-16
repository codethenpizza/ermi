import {
    CalculateShippingData,
    CalculateShippingResult,
    ShippingStrategyData
} from "@core/services/order/shipping/types";
import ShippingType from "@models/ShippingType.model";
import {ShippingStrategy} from "@core/services/order/shipping/strategies/ShippingStrategy";
import {LocalPickup} from "@core/services/order/shipping/strategies/LocalPickup";
import slugify from "slugify";
import {Courier} from "./strategies/Courier";

const s = (className: string) => slugify(className, {lower: true});

export class ShippingService {

    private readonly strategies: {[x: string]: ShippingStrategy} = {
        [s(LocalPickup.name)]: new LocalPickup(),
        [s(Courier.name)]: new Courier()
    };

    async calculateShipping({shippingTypeId, address, orderProducts}: CalculateShippingData): Promise<CalculateShippingResult[]> {
        if (
            !shippingTypeId ||
            (!address.address && !address.address_id && !address.pickup_point_id)
        ) {
            return [];
        }

        const shippingType = await ShippingType.findByPk(shippingTypeId);

        return this.strategies[s(shippingType.strategy)].calculate({
            orderProducts,
            address,
            shippingType
        });
    }

}
