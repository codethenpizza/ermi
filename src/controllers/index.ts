import {createController} from "@core/Controller";
import {AdminController} from "@controllers/admin";
import {FrontController} from "@controllers/front";

export const Controller = createController([
    {method: 'use', path: '/admin', action: AdminController},
    {method: 'use', path: '/front', action: FrontController},
]);
