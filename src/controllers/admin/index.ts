import {createController} from "@core/Controller";
import {ProductController} from "@controllers/admin/ProductController";
import {AttributeController} from "@controllers/admin/AttributeController";
import {AttrTypeController} from "@controllers/admin/AttrTypeController";
import {AttrSetController} from "@controllers/admin/AttrSetController";
import {AttrValueController} from "@controllers/admin/AttrValueController";
import {ProductCatController} from "@controllers/admin/ProductCatController";
import {ProductVariantController} from "@controllers/admin/ProductVariantController";
import {SuppliersController} from "../../modules/suppliers/Controller";
import {ImageController} from "@controllers/admin/ImageController";
import {OrderAdminController} from "@controllers/admin/OrderAdminController";
import {UserAdminController} from "@controllers/admin/UserController";
import {B2BController} from "@controllers/admin/B2BController";
import {AuthController} from "@controllers/admin/AuthController";

export const AdminController = createController([
    {method: 'use', path: '/attrs', action: AttributeController},
    {method: 'use', path: '/attr_types', action: AttrTypeController},
    {method: 'use', path: '/attr_sets', action: AttrSetController},
    {method: 'use', path: '/attr_values', action: AttrValueController},
    {method: 'use', path: '/product_cats', action: ProductCatController},
    {method: 'use', path: '/products', action: ProductController},
    {method: 'use', path: '/product_vars', action: ProductVariantController},
    {method: 'use', path: '/suppliers', action: SuppliersController},
    {method: 'use', path: '/image', action: ImageController},
    {method: 'use', path: '/order', action: OrderAdminController},
    {method: 'use', path: '/user', action: UserAdminController},
    {method: 'use', path: '/b2b', action: B2BController},
    {method: 'use', path: '/auth', action: AuthController},
]);
