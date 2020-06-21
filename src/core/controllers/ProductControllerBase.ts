import {Router} from "express";
import {ProductCreateAction} from "../actions/Product/ProductCreateAction";

export class ProductControllerBase {
  static get routes(): Router {
    const router = Router();

    // TODO ASSERT

    router.get('/create', new ProductCreateAction().handle);

    return router;
  }
}