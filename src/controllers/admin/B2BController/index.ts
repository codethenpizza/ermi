import {createController} from "@controllers/Controller";
import {B2BDiscountGroupController} from "@controllers/admin/B2BController/B2BDiscountGroupController";
import {B2BUserController} from "@controllers/admin/B2BController/B2BUserController";

export const B2BController = createController([
    {method: 'use', path: '/discount_group', action: B2BDiscountGroupController},
    {method: 'use', path: '/user', action: B2BUserController},
]);
