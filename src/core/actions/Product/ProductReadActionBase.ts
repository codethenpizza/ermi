import {Action} from '../Action'
import {NextFunction, Request, Response} from 'express';
import {Product} from "@core/models/Product";

class ProductReadActionBase implements Action {
    async handle(req: Request, res: Response) {
        const resp = await Product.find();
        res.send(resp);
    }

    assert(req: Request, res: Response, next: NextFunction): void {
        next();
    }

    get action() {
        return [this.assert, this.handle];
    }
}

export default new ProductReadActionBase();
