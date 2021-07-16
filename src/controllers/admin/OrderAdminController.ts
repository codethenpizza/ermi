import {createController} from "@core/Controller";
import {OrderListAction} from "@actions/admin/Order/OrderListAction";

export const OrderAdminController = createController([
    {method: 'get', path: '/list', action: OrderListAction}
]);
