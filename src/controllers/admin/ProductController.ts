import {createController} from "@core/Controller";
import {ProductCreateAction} from "@actions/admin/Product/ProductCreateAction";
import {ProductUpdateAction} from "@actions/admin/Product/ProductUpdateAction";
import {ProductGetListAction} from "@actions/admin/Product/ProductGetListAction";
import {ProductGetAction} from "@actions/admin/Product/ProductGetAction";
import {ProductDeleteAction} from "@actions/admin/Product/ProductDeleteAction";

export const ProductController = createController([
    {method: 'get', path: '/', action: ProductGetListAction},
    {method: 'get', path: '/:id', action: ProductGetAction},
    {method: 'post', path: '/', action: ProductCreateAction},
    {method: 'put', path: '/:id', action: ProductUpdateAction},  //update only product w/ product variant and attrs
    {method: 'delete', path: '/:id', action: ProductDeleteAction},
]);
