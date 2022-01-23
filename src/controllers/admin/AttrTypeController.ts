import {createController} from "../Controller";
import {AttrTypeDeleteAction} from "@actions/admin/AttrType/AttrTypeDeleteAction";
import {AttrTypeListAction} from "@actions/admin/AttrType/AttrTypeListAction";
import {AttrTypeCreateAction} from "@actions/admin/AttrType/AttrTypeCreateAction";
import {AttrTypeUpdateAction} from "@actions/admin/AttrType/AttrTypeUpdateAction";
import {AttrTypeGetAction} from "@actions/admin/AttrType/AttrTypeGetAction";

export const AttrTypeController = createController([
    {method: "get", path: '/', action: AttrTypeListAction},
    {method: "get", path: '/:id', action: AttrTypeGetAction},
    {method: "post", path: '/', action: AttrTypeCreateAction},
    {method: "put", path: '/:id', action: AttrTypeUpdateAction},
    {method: "delete", path: '/:id', action: AttrTypeDeleteAction},
]);
