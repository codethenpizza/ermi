import {createController} from "../../core/Controller";
import {ProductController} from "@controllers/admin/ProductController";
import {AttributeController} from "@controllers/admin/AttributeController";
import {AttrTypeController} from "@controllers/admin/AttrTypeController";
import {AttrSetController} from "@controllers/admin/AttrSetController";
import {AttrValueController} from "@controllers/admin/AttrValueController";
import {ProductCatController} from "@controllers/admin/ProductCatController";
import {ProductVariantController} from "@controllers/admin/ProductVariantController";
import {WheelSizeController} from "../../modules/wheel-size/Controller";
import {SuppliersController} from "../../modules/suppliers/Controller";

export const AdminController = createController([
    {method: 'use', path: '/attrs', action: AttributeController},
    {method: 'use', path: '/attr_types', action: AttrTypeController},
    {method: 'use', path: '/attr_sets', action: AttrSetController},
    {method: 'use', path: '/attr_values', action: AttrValueController},
    {method: 'use', path: '/product_cats', action: ProductCatController},
    {method: 'use', path: '/products', action: ProductController},
    {method: 'use', path: '/product_vars', action: ProductVariantController},
    {method: 'use', path: '/suppliers', action: SuppliersController},
]);
