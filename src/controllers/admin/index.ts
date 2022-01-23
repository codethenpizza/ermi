import {createController} from "@controllers/Controller";
import {ProductController} from "@controllers/admin/ProductController";
import {AttributeController} from "@controllers/admin/AttributeController";
import {AttrTypeController} from "@controllers/admin/AttrTypeController";
import {AttrSetController} from "@controllers/admin/AttrSetController";
import {AttrValueController} from "@controllers/admin/AttrValueController";
import {ProductCatController} from "@controllers/admin/ProductCatController";
import {ProductVariantController} from "@controllers/admin/ProductVariantController";
import {ImageController} from "@controllers/admin/ImageController";
import {OrderAdminController} from "@controllers/admin/OrderAdminController";
import {UserAdminController} from "@controllers/admin/UserController";
import {B2BController} from "@controllers/admin/B2BController";
import {AuthController} from "@controllers/admin/AuthController";
import {isAuth} from "../../middlewares/auth";

export const AdminController = createController([
    {method: 'use', path: '/attrs', middlewares: [isAuth], action: AttributeController},
    {method: 'use', path: '/attr_types', middlewares: [isAuth], action: AttrTypeController},
    {method: 'use', path: '/attr_sets', middlewares: [isAuth], action: AttrSetController},
    {method: 'use', path: '/attr_values', middlewares: [isAuth], action: AttrValueController},
    {method: 'use', path: '/product_cats', middlewares: [isAuth], action: ProductCatController},
    {method: 'use', path: '/products', middlewares: [isAuth], action: ProductController},
    {method: 'use', path: '/product_vars', middlewares: [isAuth], action: ProductVariantController},
    // {method: 'use', path: '/suppliers', middlewares: [isAuth], action: SuppliersController},
    {method: 'use', path: '/image', middlewares: [isAuth], action: ImageController},
    {method: 'use', path: '/order', middlewares: [isAuth], action: OrderAdminController},
    {method: 'use', path: '/user', middlewares: [isAuth], action: UserAdminController},
    {method: 'use', path: '/b2b', middlewares: [isAuth], action: B2BController},
    {method: 'use', path: '/auth', action: AuthController},
]);
