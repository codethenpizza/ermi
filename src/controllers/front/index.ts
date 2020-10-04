import {createController} from "../../core/Controller";
import {FrontProductController} from "@controllers/front/ProductController";
import {WheelSizeController} from "../../modules/wheel-size/Controller";

export const FrontController = createController([
    {method: 'use', path: '/products', action: FrontProductController},
    {method: 'use', path: '/wheel_size', action: WheelSizeController},
]);
