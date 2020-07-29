import {Router} from "express";

import AttrSetCreateAction from "@actions/AttrSet/AttrSetCreateAction";
import AttrSetDeleteAction from "@actions/AttrSet/AttrSetDeleteAction";
import AttrSetListAction from "@actions/AttrSet/AttrSetListAction";
import AttrSetGetAction from "@actions/AttrSet/AttrSetGetAction";
import AttrSetUpdateAction from "@actions/AttrSet/AttrSetUpdateAction";

const AttrSetController = Router();

AttrSetController.get('/', ...AttrSetListAction.action);
AttrSetController.get('/:id', ...AttrSetGetAction.action);
AttrSetController.post('/', ...AttrSetCreateAction.action);
AttrSetController.put('/:id', ...AttrSetUpdateAction.action);
AttrSetController.delete('/:id', ...AttrSetDeleteAction.action);

export {AttrSetController};
