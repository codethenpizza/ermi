import {IDiscount} from "@core/models/Discount.model";
import Address from "@core/models/Address.model";
import {ICalculateShippingResult} from "@core/services/order/shipping/types";
import {IUser} from "@core/models/User.model";
import {IOrder} from "@core/models/Order.model";
import {Elastic} from "@core/services/elastic/types";


export interface ICreateOrderData {
    productItems: ICreateOrderDataProduct[];
    shipping_type_id: number;
    payment_strategy_id: number;
    address: ICreateOrderDataAddress;
    user_id?: number;
    userData?: Partial<IUser>;
    meta?: ICreateOrderDataMeta[];
}

export interface ICreateOrderDataAddress {
    address_id?: number;
    pickup_point_id?: number;
    address?: Partial<Address>;
}

export interface ICreateOrderDataProduct {
    offer_id: number;
    qty: number;
}

export interface ICreateOrderDataMeta {
    key: string;
    value: any;
}

export interface ICalculateOrderTotal {
    discounts: IDiscount[];
    shipping: ICalculateShippingResult[];
}

export interface ICalculateOrderResult extends ICalculateOrderTotal {
    total: number;
    b2b_discount_id?: number;
}

export interface IOrderResp {
    order: IOrder;
    esOrderProducts: Elastic.ProductVariantFormatted[];
}
