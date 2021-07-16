import {createController} from "@core/Controller";
import {Register} from "@actions/front/Auth/Register";
import {Login} from "@actions/front/Auth/Login";
import {User} from "@actions/front/Auth/User";

export const AuthController = createController([
    {method: 'post', path: '/register', action: Register},
    {method: 'post', path: '/login', action: Login},
    {method: 'get', path: '/user', action: User},
]);
