import {createController} from "../Controller";
import {AttributeListAction} from "@actions/admin/Attribute/AttributeListAction";
import {AttributeGetAction} from "@actions/admin/Attribute/AttributeGetAction";
import {AttributeCreateAction} from "@actions/admin/Attribute/AttributeCreateAction";
import {AttributeUpdateAction} from "@actions/admin/Attribute/AttributeUpdateAction";
import {AttributeDeleteAction} from "@actions/admin/Attribute/AttributeDeleteAction";

export const AttributeController = createController([
    {method: 'get', path: '/', action: AttributeListAction},
    {method: 'get', path: '/:id', action: AttributeGetAction},
    {method: 'post', path: '/', action: AttributeCreateAction},
    {method: 'put', path: '/:id', action: AttributeUpdateAction},
    {method: 'delete', path: '/:id', action: AttributeDeleteAction},
]);
