import {Router} from "express";

import AttrTypeListAction from "@actions/AttrType/AttrTypeListAction";
import AttrTypeGetAction from "@actions/AttrType/AttrTypeGetAction";
import AttrTypeCreateAction from "@actions/AttrType/AttrTypeCreateAction";
import AttrTypeUpdateAction from "@actions/AttrType/AttrTypeUpdateAction";
import AttrTypeDeleteAction from "@actions/AttrType/AttrTypeDeleteAction";

const AttrTypeController = Router();

AttrTypeController.get('/', ...AttrTypeListAction.action);
AttrTypeController.get('/:id', ...AttrTypeGetAction.action);
AttrTypeController.post('/', ...AttrTypeCreateAction.action);
AttrTypeController.put('/:id', ...AttrTypeUpdateAction.action);
AttrTypeController.delete('/:id', ...AttrTypeDeleteAction.action);

export {AttrTypeController};
