import {NextFunction, Request, Response} from "express";
import Product from "@models/Product.model";
import {Action} from "@projTypes/action";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";


class ProductGetListAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const model = await Product.findAll({
                include: [
                    {model: ProductVariant, include: [AttrValue]}
                ]
            });
            res.send(model);
        } catch (error) {
            res.status(500).send({error});
        }
    }
}

export default new ProductGetListAction();