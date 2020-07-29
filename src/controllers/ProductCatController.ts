import {Router} from "express";

import ProductCatListAction from "@actions/ProductCat/ProductCatListAction";
import ProductCatGetAction from "@actions/ProductCat/ProductCatGetAction";
import ProductCatCreateAction from "@actions/ProductCat/ProductCatCreateAction";
import ProductCatUpdateAction from "@actions/ProductCat/ProductCatUpdateAction";
import ProductCatDeleteAction from "@actions/ProductCat/ProductCatDeleteAction";

const ProductCatController = Router();

ProductCatController.get('/', ...ProductCatListAction.action);
ProductCatController.get('/:id', ...ProductCatGetAction.action);
ProductCatController.post('/', ...ProductCatCreateAction.action);
ProductCatController.put('/:id', ...ProductCatUpdateAction.action);
ProductCatController.delete('/:id', ...ProductCatDeleteAction.action);

export {ProductCatController};
