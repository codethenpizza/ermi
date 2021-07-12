import {IOrderProduct} from "@models/OrderProduct.model";
import {IShipping} from "@models/Shipping.model";
import {CreateOrderDataAddress} from "@core/services/order/types";

export interface ShippingStrategyData {
    orderProducts: IOrderProduct[];
    address: CreateOrderDataAddress;
    shippingTypeId: number;
}

export interface CalculateShippingResult {
    shipping: Partial<IShipping>;
    orderProducts: IOrderProduct[];
}
