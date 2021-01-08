import {createController} from "@core/Controller";
import {AttrValueDeleteAction} from "@actions/admin/AttrValue/AttrValueDeleteAction";
import {AttrValueCreateAction} from "@actions/admin/AttrValue/AttrValueCreateAction";
import {AttrValueUpdateAction} from "@actions/admin/AttrValue/AttrValueUpdateAction";

export const AttrValueController = createController([
    {method: 'post', path: '/', action: AttrValueCreateAction},
    {method: 'put', path: '/:id', action: AttrValueUpdateAction},
    {method: 'delete', path: '/:id', action: AttrValueDeleteAction},
]);
