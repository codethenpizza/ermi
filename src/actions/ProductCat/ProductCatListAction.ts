import {NextFunction, Response, Request} from "express";

import {Action} from "@projTypes/action";
import ProductCategory from "@models/Category.model";

class ProductCatListAction extends Action {
    get action() {
        return [this.assert, this.handle];
    }

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

export default new ProductCatListAction();
