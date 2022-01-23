import {createController} from "@controllers/Controller";
import {OrderListAction} from "@actions/admin/Order/OrderListAction";
import {OrderUpdateAction} from "@actions/admin/Order/OrderUpdateAction";

export const OrderAdminController = createController([
    {method: 'get', path: '/list', action: OrderListAction},
    {method: 'put', path: '/:id', action: OrderUpdateAction}
]);
