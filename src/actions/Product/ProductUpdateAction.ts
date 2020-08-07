import {NextFunction, Request, Response} from "express";
import Product, {IProduct} from "@models/Product.model";
import {Action} from "@projTypes/action";

type ReqParams = {
    id: string;
};

class ProductCreateAction implements Action{
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<ReqParams, any, IProduct, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number query param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, IProduct, any>, res: Response) {
        const id = parseInt(req.params.id);
        try {
            const updateResult = await Product.update(req.body, {
                where: {id}
            });
            const isUpdated = !!updateResult[0];
            if (isUpdated) {
                res.status(202).send();
            } else {
                res.status(400).send({error: `product with id=${id} not found`});
            }
        } catch (error) {
            res.status(500).send({error});
        }
    }
}

export default new ProductCreateAction();