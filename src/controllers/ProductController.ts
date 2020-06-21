import {ProductControllerBase} from "../core/controllers/ProductControllerBase";
import {Router} from "express";

// class variableProduct {
//   static get routes() {
//     const router = Router();
//     return router;
//   }
// }

export class ProductController{
  static get routes(): Router {
    const router: Router = ProductControllerBase.routes;

    //router.use(variableProduct.routes);


    return router;
  }
}