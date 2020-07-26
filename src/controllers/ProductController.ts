import {Router} from "express";
import ProductCreateAction from "@actions/Product/ProductCreateAction";
import ProductReadAction from "@actions/Product/ProductReadAction";


const ProductController = Router();

ProductController.get('/create', ...ProductCreateAction.action);
ProductController.get('/', ...ProductReadAction.action);

export {ProductController};
