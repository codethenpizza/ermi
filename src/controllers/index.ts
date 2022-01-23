import {createController} from "@controllers/Controller";
import {AdminController} from "@controllers/admin";
import {FrontController} from "@controllers/front";
import {HealthCheck} from "@actions/HealthCheck";

export const Controller = createController([
    {method: 'use', path: '/admin', action: AdminController},
    {method: 'use', path: '/front', action: FrontController},
    {method: 'get', path: '/', action: HealthCheck}
]);
