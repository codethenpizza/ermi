import {createController} from "@controllers/Controller";
import {Login} from "@actions/admin/Auth/Login";
import {RefreshTokenAction} from "@actions/common/RefreshTokenAction"
import {User} from "@actions/common/User";

export const AuthController = createController([
    {method: 'post', path: '/refreshToken', action: RefreshTokenAction},
    {method: 'post', path: '/login', action: Login},
    {method: 'get', path: '/user', action: User},
]);
