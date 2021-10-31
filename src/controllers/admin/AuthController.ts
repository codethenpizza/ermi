import {createController} from "@core/Controller";
import {Login} from "@actions/admin/Auth/Login";
import {RefreshTokenAction} from "@actions/common/RefreshTokenAction"

export const AuthController = createController([
    {method: 'post', path: '/refreshToken', action: RefreshTokenAction},
    {method: 'post', path: '/login', action: Login},
]);
