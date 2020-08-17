import {NextFunction, Request, Response} from "express";
import Product, {IProduct} from "@models/Product.model";
import {Action} from "@projTypes/action";

type ReqParams = {
    id: string;
};

class ProductUpdateAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<ReqParams, any, IProduct, any>, res: Response, next: NextFunction) {
        if (!req.params.id) {
            res.status(400).send({error: 'id is required for product update'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, IProduct, any>, res: Response) {
        const id = parseInt(req.params.id);
        const product = req.body;
        try {
            await Product.updateWR(id, product);
            res.status(202).send();
        } catch (error) {
            res.status(500).send({error});
        }
    }
}

export default new ProductUpdateAction();