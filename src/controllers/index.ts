import {Router} from "express";

import {UserController} from "@controllers/UserController";
import {ProductController} from "@controllers/ProductController";
import {AttributeController} from "@controllers/AttributeController";

const Controller = Router();

Controller.use('/product', ProductController);
Controller.use('/user', UserController);
Controller.use('/attr', AttributeController);

export {Controller};
