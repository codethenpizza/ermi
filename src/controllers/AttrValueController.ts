import {Router} from "express";
import AttrValueCreateAction from "@actions/AttrValue/AttrValueCreateAction";
import AttrValueUpdateAction from "@actions/AttrValue/AttrValueUpdateAction";
import AttrValueDeleteAction from "@actions/AttrValue/AttrValueDeleteAction";

const AttrValueController = Router();

AttrValueController.post('/', ...AttrValueCreateAction.action);
AttrValueController.put('/:id', ...AttrValueUpdateAction.action);
AttrValueController.delete('/:id', ...AttrValueDeleteAction.action);

export {AttrValueController};
