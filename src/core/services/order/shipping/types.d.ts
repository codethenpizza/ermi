import {IOrderOfferCalculate} from "@core/models/OrderOffer.model";
import {IShipping} from "@core/models/Shipping.model";
import {ICreateOrderDataAddress} from "@core/services/order/types";
import {IShippingType} from "@core/models/ShippingType.model";

export interface ICalculateShippingData {
    orderProducts: IOrderOfferCalculate[];
    address: ICreateOrderDataAddress;
    shippingTypeId: number;
}

export interface IShippingStrategyData {
    orderProducts: IOrderOfferCalculate[];
    address: ICreateOrderDataAddress;
    shippingType: IShippingType;
}

export interface ICalculateShippingResult {
    shipping: Partial<IShipping>;
    orderProducts: IOrderOfferCalculate[];
}
