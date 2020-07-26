import {Router} from "express";
import AttributeCreateAction from "@actions/Attribute/AttributeCreateAction";
import AttributeListAction from "@actions/Attribute/AttributeListAction";
import AttributeUpdateAction from "@actions/Attribute/AttributeUpdateAction";
import AttributeDeleteAction from "@actions/Attribute/AttributeDeleteAction";
import AttributeGetAction from "@actions/Attribute/AttributeGetAction";

const AttributeController = Router();

AttributeController.get('/', ...AttributeListAction.action);
AttributeController.get('/:id', ...AttributeGetAction.action);
AttributeController.post('/', ...AttributeCreateAction.action);
AttributeController.put('/:id', ...AttributeUpdateAction.action);
AttributeController.delete('/:id', ...AttributeDeleteAction.action);

export {AttributeController};
