import {LocalPickup} from "@core/services/order/shipping/strategies/LocalPickup";
import {Courier} from "@core/services/order/shipping/strategies/Courier";
import {ShippingStrategy} from "@core/services/order/shipping/strategies/ShippingStrategy";
import {customStringify} from "@core/helpers/utils";

export const shippingStrategies: { [x: string]: ShippingStrategy } = {
    [customStringify(LocalPickup.name)]: new LocalPickup(),
    [customStringify(Courier.name)]: new Courier()
}
