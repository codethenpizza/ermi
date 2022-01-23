import {createController} from "@controllers/Controller";
import {Register} from "@actions/front/Auth/Register";
import {Login} from "@actions/front/Auth/Login";
import {User} from "@actions/common/User";
import {RefreshTokenAction} from "@actions/common/RefreshTokenAction"

export const AuthController = createController([
    {method: 'post', path: '/refreshToken', action: RefreshTokenAction},
    {method: 'post', path: '/register', action: Register},
    {method: 'post', path: '/login', action: Login},
    {method: 'get', path: '/user', action: User},
]);
