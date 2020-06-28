import {ProductControllerBase} from "@core/controllers/ProductControllerBase";
import {Router} from "express";

export class ProductController{
  static get routes(): Router {
    // Add external routes here
    return ProductControllerBase.routes;
  }
}
