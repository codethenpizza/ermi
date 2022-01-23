import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import ProductCategory, {IProductCategory} from "@core/models/ProductCategory.model";

export class ProductCatCreateAction extends Action {


    assert(req: Request<any, any, IProductCategory, any>, res: Response, next: NextFunction) {
        const {name} = req.body;
        if (name) {
            next();
        } else {
            res.status(400).send({error: 'name is required param'});
        }
    }

    async handle(req: Request<any, any, IProductCategory, any>, res: Response) {
        try {
            const model = new ProductCategory(req.body);
            await model.save();
            res.send(model);
        } catch (error) {
            res.status(400).send({error});
        }
    }
}
