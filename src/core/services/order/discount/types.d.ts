import User from "@core/models/User.model";
import {IOrderOfferCalculate} from "@core/models/OrderOffer.model";
import {ICreateOrderDataMeta} from "@core/services/order/types";
import {ICalculateShippingResult} from "@core/services/order/shipping/types";

export interface CalculateDiscountData {
    user: User;
    orderProducts: IOrderOfferCalculate[];
    shipping: ICalculateShippingResult[];
    meta?: ICreateOrderDataMeta[];
}
