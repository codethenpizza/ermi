import {Router} from "express";
import ProductCreateAction from "@actions/Product/ProductCreateAction";
import ProductReadAction from "@actions/Product/ProductReadAction";


export class ProductController{
  static get routes(): Router {
    const router = Router();

    router.get('/create', ...ProductCreateAction.action);
    router.get('/', ...ProductReadAction.action);
    return router;
  }
}
