import {Router} from "express";

import {UserController} from "@controllers/UserController";
import {ProductController} from "@controllers/ProductController";
import {AttributeController} from "@controllers/AttributeController";
import {AttrTypeController} from "@controllers/AttrTypeController";
import {AttrSetController} from "@controllers/AttrSetController";
import {AttrValueController} from "@controllers/AttrValueController";
import {ProductCatController} from "@controllers/ProductCatController";
import {ProductVariantController} from "@controllers/ProductVariantController";

const Controller = Router();

Controller.use('/users', UserController);
Controller.use('/attrs', AttributeController);
Controller.use('/attr_types', AttrTypeController);
Controller.use('/attr_sets', AttrSetController);
Controller.use('/attr_values', AttrValueController);
Controller.use('/product_cats', ProductCatController);
Controller.use('/products', ProductController);
Controller.use('/product_vars', ProductVariantController);



export {Controller};
