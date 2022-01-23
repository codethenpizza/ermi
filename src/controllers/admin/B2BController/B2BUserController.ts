import {createController} from "@controllers/Controller";
import {B2BUserListAction} from "@actions/admin/B2B/User/B2BUserListAction";
import {B2BUserCreateAction} from "@actions/admin/B2B/User/B2BUserCreateAction";
import {B2BUserUpdateAction} from "@actions/admin/B2B/User/B2BUserUpdateAction";
import {B2BUserRemoveAction} from "@actions/admin/B2B/User/B2BUserRemoveAction";

export const B2BUserController = createController([
    {method: 'get', path: '/', action: B2BUserListAction},
    {method: 'post', path: '/', action: B2BUserCreateAction},
    {method: 'put', path: '/:id', action: B2BUserUpdateAction},
    {method: 'delete', path: '/:id', action: B2BUserRemoveAction},
]);
