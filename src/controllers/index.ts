import {Router} from "express";

import {UserController} from "@controllers/UserController";
import {ProductController} from "@controllers/ProductController";

const Controller = Router();

Controller.use('/product', ProductController);
Controller.use('/user', UserController);

export {Controller};
