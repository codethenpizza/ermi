import {NextFunction, Request, Response} from "express";
import Product from "@models/Product.model";
import {Action} from "@projTypes/action";

type ReqParams = {
    id: string;
};

export class ProductDeleteAction implements Action {
    get action() {
        return [this.assert, this.handle];
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
            const isDeleted = await Product.destroy({
                where: {id}
            });
            if (!!isDeleted) {
                res.status(202).send();
            } else {
                res.status(400).send({error: `product with id=${id} not found`});
            }
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
