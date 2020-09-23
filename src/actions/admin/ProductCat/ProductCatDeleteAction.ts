import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import ProductCategory from "@models/ProductCategory.model";

type ReqParams = {
    id: string;
};

export class ProductCatDeleteAction extends Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const isDeleted = await ProductCategory.destroy({where: {id}});
            if (!!isDeleted) {
                res.status(202).send();
            } else {
                res.status(400).send({error: `category with id=${id} not found`});
            }
        } catch (error) {
            res.status(400).send({error});
        }

    }

}
