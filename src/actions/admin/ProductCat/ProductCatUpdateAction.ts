import {NextFunction, Request, Response} from "express";

import {Action} from "@projTypes/action";
import Attribute from "@models/Attribute.model";
import {IProductCategory} from "@models/ProductCategory.model";
import {isAuth} from "../../../middlewares/auth";

type ReqParams = {
    id: string;
};

export class ProductCatUpdateAction extends Action {
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

    async handle(req: Request<ReqParams, any, IProductCategory, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const updateResult = await Attribute.update(req.body, {where: {id}});
            const isUpdated = !!updateResult[0];
            if (isUpdated) {
                res.status(202).send();
            } else {
                res.status(400).send({error: `category with id=${id} not found`});
            }
        } catch (error) {
            res.status(400).send({error});
        }
    }

}
