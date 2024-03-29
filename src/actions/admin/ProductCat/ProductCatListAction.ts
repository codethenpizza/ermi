import {NextFunction, Request, Response} from "express";

import {Action} from "@actions/Action";
import ProductCategory from "@core/models/ProductCategory.model";

export class ProductCatListAction extends Action {
    

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const models = await ProductCategory.findAll();
            res.send(models);
        } catch (error) {
            res.status(400).send({error});
        }
    }
}
