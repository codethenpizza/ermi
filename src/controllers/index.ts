import {Router} from "express";
import {ProductController} from "./ProductController";

const Controller = Router();

Controller.use('product', ProductController.routes);

export {Controller};