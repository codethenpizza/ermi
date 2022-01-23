import {createController} from "../Controller";
import {AttrSetGetAction} from "@actions/admin/AttrSet/AttrSetGetAction";
import {AttrSetListAction} from "@actions/admin/AttrSet/AttrSetListAction";
import {AttrSetCreateAction} from "@actions/admin/AttrSet/AttrSetCreateAction";
import {AttrSetUpdateAction} from "@actions/admin/AttrSet/AttrSetUpdateAction";
import {AttrSetDeleteAction} from "@actions/admin/AttrSet/AttrSetDeleteAction";

export const AttrSetController = createController([
    {method: 'get', path: '/', action: AttrSetListAction},
    {method: 'get', path: '/:id', action: AttrSetGetAction},
    {method: 'post', path: '/', action: AttrSetCreateAction},
    {method: 'put', path: '/:id', action: AttrSetUpdateAction},
    {method: 'delete', path: '/:id', action: AttrSetDeleteAction},
]);
