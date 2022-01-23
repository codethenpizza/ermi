import {ICalculateShippingData, ICalculateShippingResult} from "@core/services/order/shipping/types";
import ShippingType from "@core/models/ShippingType.model";
import {ShippingStrategy} from "@core/services/order/shipping/strategies/ShippingStrategy";
import {customStringify} from "@core/helpers/utils";
import {Transaction} from "sequelize";

export class ShippingService {

    constructor(
        private readonly strategies: { [x: string]: ShippingStrategy }
    ) {
    }

    async calculateShipping(data: ICalculateShippingData, transaction?: Transaction): Promise<ICalculateShippingResult[]> {
        const {shippingTypeId, address, orderProducts} = data;

        if (
            !shippingTypeId ||
            (!address.address && !address.address_id && !address.pickup_point_id)
        ) {
            return [];
        }

        const shippingType = await ShippingType.findByPk(shippingTypeId, {transaction});

        return this.strategies[customStringify(shippingType.strategy)].calculate({
            orderProducts,
            address,
            shippingType,
        }, transaction);
    }

}
