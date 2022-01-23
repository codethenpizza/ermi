import {createController} from "@controllers/Controller";
import {AttrValueDeleteAction} from "@actions/admin/AttrValue/AttrValueDeleteAction";
import {AttrValueCreateAction} from "@actions/admin/AttrValue/AttrValueCreateAction";
import {AttrValueUpdateAction} from "@actions/admin/AttrValue/AttrValueUpdateAction";
import {AttrValueListByAttrSlugAction} from "@actions/admin/AttrValue/AttrValueListByAttrSlugAction";

export const AttrValueController = createController([
    {method: 'post', path: '/', action: AttrValueCreateAction},
    {method: 'put', path: '/:id', action: AttrValueUpdateAction},
    {method: 'delete', path: '/:id', action: AttrValueDeleteAction},
    {method: 'get', path: '/:slug', action: AttrValueListByAttrSlugAction},
]);
