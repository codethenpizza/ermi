import {createController} from "@core/Controller";
import {UserGetAction} from "@actions/admin/User/UserGetAction";

export const UserAdminController = createController([
    {method: 'get', path: '/get', action: UserGetAction}
]);
