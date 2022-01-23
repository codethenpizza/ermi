import {createController} from "@controllers/Controller";
import {OrderCalculateAction} from "@actions/front/Order/OrderCalculateAction";
import {OrderCreateAction} from "@actions/front/Order/OrderCreateAction";
import {OrderShippingListAction} from "@actions/front/Order/OrderShippingListAction";
import {OrderPickupPointsListAction} from "@actions/front/Order/OrderPickupPointsListAction";
import {OrderHistoryAction} from "@actions/front/Order/OrderHistoryAction";

export const OrderController = createController([
    {method: 'post', path: '/calculate', action: OrderCalculateAction},
    {method: 'post', path: '/create', action: OrderCreateAction},
    {method: 'get', path: '/shippingList', action: OrderShippingListAction},
    {method: 'get', path: '/pickupPointsList', action: OrderPickupPointsListAction},
    {method: 'get', path: '/history', action: OrderHistoryAction},
]);
