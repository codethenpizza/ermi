import {createController} from "../Controller";
import {ProductVariantDeleteAction} from "@actions/admin/ProductVariant/ProductVariantDeleteAction";
import {ProductVariantCreateAction} from "@actions/admin/ProductVariant/ProductVariantCreateAction";
import {ProductVariantUpdateAction} from "@actions/admin/ProductVariant/ProductVariantUpdateAction";

export const ProductVariantController = createController([
    {method: 'post', path: '/', action: ProductVariantCreateAction},
    {method: 'put', path: '/:id', action: ProductVariantUpdateAction},
    {method: 'delete', path: '/:id', action: ProductVariantDeleteAction},
]);
