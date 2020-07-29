import {Router} from "express";

import {UserController} from "@controllers/UserController";
import {ProductController} from "@controllers/ProductController";
import {AttributeController} from "@controllers/AttributeController";
import {AttrTypeController} from "@controllers/AttrTypeController";

const Controller = Router();

Controller.use('/product', ProductController);
Controller.use('/user', UserController);
Controller.use('/attr', AttributeController);
Controller.use('/attr_type', AttrTypeController);

export {Controller};
