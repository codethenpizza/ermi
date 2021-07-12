import User from "@models/User.model";
import {IOrderProduct} from "@models/OrderProduct.model";
import {CreateOrderDataMeta} from "@core/services/order/types";
import {CalculateShippingResult} from "@core/services/order/shipping/types";

export interface CalculateDiscountData {
    user: User;
    orderProducts: IOrderProduct[];
    shipping: CalculateShippingResult[];
    meta?: CreateOrderDataMeta[];
}
