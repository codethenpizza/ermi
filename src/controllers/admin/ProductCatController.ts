import {createController} from "../../core/Controller";
import {ProductCatListAction} from "@actions/admin/ProductCat/ProductCatListAction";
import {ProductCatUpdateAction} from "@actions/admin/ProductCat/ProductCatUpdateAction";
import {ProductCatCreateAction} from "@actions/admin/ProductCat/ProductCatCreateAction";
import {ProductCatDeleteAction} from "@actions/admin/ProductCat/ProductCatDeleteAction";
import {ProductCatGetAction} from "@actions/admin/ProductCat/ProductCatGetAction";

export const ProductCatController = createController([
    {method: 'get', path: '/', action: ProductCatListAction},
    {method: 'get', path: '/:id', action: ProductCatGetAction},
    {method: 'post', path: '/', action: ProductCatCreateAction},
    {method: 'put', path: '/:id', action: ProductCatUpdateAction},
    {method: 'delete', path: '/:id', action: ProductCatDeleteAction},
]);
