import {Action} from '../Action'
import {NextFunction, Request, Response} from 'express';
import {IProduct, Product} from "@core/models/Product";

class ProductCreateActionBase implements Action {
    async handle(req: Request<{}, {}, {}, IProduct>, res: Response) {
        const resp = await Product.create(req.query);
        res.send(resp);
    }

    assert(req: Request<{}, {}, {}, IProduct>, res: Response, next: NextFunction): void {
        if(req.query.title && req.query.desc && req.query.cost) {
            next();
        } else {
            res.send(`error: ${JSON.stringify(req.query)}`);
        }
    }

    get action() {
        return [this.assert, this.handle];
    }
}

export default new ProductCreateActionBase();
