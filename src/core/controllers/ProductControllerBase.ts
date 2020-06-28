import {Router} from "express";
import ProductCreateActionBase from "@core/actions/Product/ProductCreateActionBase";
import ProductReadActionBase from "@core/actions/Product/ProductReadActionBase";

export class ProductControllerBase {
  static get routes(): Router {
    const router = Router();

    router.get('/create', ...ProductCreateActionBase.action);
    router.get('/', ...ProductReadActionBase.action);
    return router;
  }
}
