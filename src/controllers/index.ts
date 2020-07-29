import {Router} from "express";

import {UserController} from "@controllers/UserController";
import {ProductController} from "@controllers/ProductController";
import {AttributeController} from "@controllers/AttributeController";
import {AttrTypeController} from "@controllers/AttrTypeController";
import {AttrSetController} from "@controllers/AttrSetController";

const Controller = Router();

Controller.use('/product', ProductController);
Controller.use('/user', UserController);
Controller.use('/attr', AttributeController);
Controller.use('/attr_type', AttrTypeController);
Controller.use('/attr_set', AttrSetController);

export {Controller};
