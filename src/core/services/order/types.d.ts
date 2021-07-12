import {IDiscount} from "@models/Discount.model";
import Address from "@models/Address.model";
import {CalculateShippingResult} from "@core/services/order/shipping/types";

export interface CreateOrderData {
    productItems: CreateOrderDataProduct[];
    user_id?: number;
    shipping_type_id?: number;
    address: CreateOrderDataAddress;
    payment_strategy_id?: number;
    meta?: CreateOrderDataMeta[];
}

export interface CreateOrderDataAddress {
    address_id?: number;
    pickup_point_id?: number;
    address?: Partial<Address>;
}

export interface CreateOrderDataProduct {
    product_variant_id: number;
    qty: number;
}

export interface CreateOrderDataMeta {
    key: string;
    value: any;
}

export interface CalculateOrderTotal {
    discounts: IDiscount[];
    shipping: CalculateShippingResult[];
}

export interface CalculateOrderResult extends CalculateOrderTotal {
    total: number;
}
