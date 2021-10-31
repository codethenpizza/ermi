import {createController} from "@core/Controller";
import {Login} from "@actions/admin/Auth/Login";

export const AuthController = createController([
    {method: 'post', path: '/login', action: Login},
]);
