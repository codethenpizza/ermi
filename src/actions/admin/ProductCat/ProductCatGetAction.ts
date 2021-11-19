import {NextFunction, Request, Response} from "express";

import {Action} from "@projTypes/action";
import ProductCategory from "@models/ProductCategory.model";
import {isAuth} from "../../../middlewares/auth";

type ReqParams = {
    id: string;
};

export class ProductCatGetAction extends Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number query param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const model = await ProductCategory.findOne({where: {id}});
            if (model instanceof ProductCategory) {
                res.send(model);
            } else {
                res.status(400).send({error: `category with id=${id} not found`});
            }
        } catch (error) {
            res.status(400).send({error});
        }
    }

}
