import {createController} from "@core/Controller";
import {OrderCalculateAction} from "@actions/front/Order/OrderCalculateAction";
import {OrderCreateAction} from "@actions/front/Order/OrderCreateAction";

export const OrderController = createController([
    {method: 'post', path: '/calculate', action: OrderCalculateAction},
    {method: 'post', path: '/create', action: OrderCreateAction},
]);
