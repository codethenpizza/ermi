import {IOrderProduct} from "@models/OrderProduct.model";
import {IShipping} from "@models/Shipping.model";
import {CreateOrderDataAddress} from "@core/services/order/types";
import ShippingType from "@models/ShippingType.model";

export interface CalculateShippingData {
    orderProducts: IOrderProduct[];
    address: CreateOrderDataAddress;
    shippingTypeId: number;
}

export interface ShippingStrategyData {
    orderProducts: IOrderProduct[];
    address: CreateOrderDataAddress;
    shippingType: ShippingType;
}

export interface CalculateShippingResult {
    shipping: Partial<IShipping>;
    orderProducts: IOrderProduct[];
}
