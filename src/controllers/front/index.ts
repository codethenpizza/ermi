import {createController} from "@core/Controller";
import {FrontProductController} from "@controllers/front/ProductController";
import {WheelSizeController} from "../../modules/wheel-size/Controller";
import {AuthController} from "@controllers/front/AuthController";
import {OrderController} from "@controllers/front/OrderController";

export const FrontController = createController([
    {method: 'use', path: '/products', action: FrontProductController},
    {method: 'use', path: '/wheel_size', action: WheelSizeController},
    {method: 'use', path: '/auth', action: AuthController},
    {method: 'use', path: '/order', action: OrderController},
]);
