import {createController} from "@controllers/Controller";
import {UserGetAction} from "@actions/admin/User/UserGetAction";

export const UserAdminController = createController([
    {method: 'get', path: '/get', action: UserGetAction}
]);
