import {createController} from "@core/Controller";
import {UpdateSuppliersProductsAction} from "./actions/UpdateSuppliersProductsAction";

export const SuppliersController = createController([
    {method: 'get', path: '/update-store', action: UpdateSuppliersProductsAction},
]);
