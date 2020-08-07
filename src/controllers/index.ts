import {Router} from "express";

import {UserController} from "@controllers/UserController";
import {ProductController} from "@controllers/ProductController";
import {AttributeController} from "@controllers/AttributeController";
import {AttrTypeController} from "@controllers/AttrTypeController";
import {AttrSetController} from "@controllers/AttrSetController";
import {AttrValueController} from "@controllers/./AttrValueController";
import {ProductCatController} from "@controllers/ProductCatController";
import {ProductVariantController} from "@controllers/./ProductVariantController";

const Controller = Router();

Controller.use('/user', UserController);
Controller.use('/attr', AttributeController);
Controller.use('/attr_type', AttrTypeController);
Controller.use('/attr_set', AttrSetController);
Controller.use('/attr_value', AttrValueController);
Controller.use('/product_cat', ProductCatController);
Controller.use('/product', ProductController);
Controller.use('/product_var', ProductVariantController);



export {Controller};
