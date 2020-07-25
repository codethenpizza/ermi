import {Action} from '../Action'
import {NextFunction, Request, Response} from 'express';
import {ProductModel} from "@models/Product";


class ProductReadAction implements Action {
    async handle(req: Request, res: Response) {
        const resp = await ProductModel.find();
        res.send(resp);
    }

    assert(req: Request, res: Response, next: NextFunction): void {
        next();
    }

    get action() {
        return [this.assert, this.handle];
    }
}

export default new ProductReadAction();
