import {createController} from "@core/Controller";
import {B2BDiscountGroupListAction} from "@actions/admin/B2B/Discount/B2BDiscountGroupListAction";
import {B2BDiscountGroupCreateAction} from "@actions/admin/B2B/Discount/B2BDiscountGroupCreateAction";
import {B2BDiscountGroupUpdateAction} from "@actions/admin/B2B/Discount/B2BDiscountGroupUpdateAction";
import {B2BDiscountGroupRemoveAction} from "@actions/admin/B2B/Discount/B2BDiscountGroupRemoveAction";

export const B2BDiscountGroupController = createController([
    {method: 'get', path: '/', action: B2BDiscountGroupListAction},
    {method: 'post', path: '/', action: B2BDiscountGroupCreateAction},
    {method: 'put', path: '/:id', action: B2BDiscountGroupUpdateAction},
    {method: 'delete', path: '/:id', action: B2BDiscountGroupRemoveAction},
]);
