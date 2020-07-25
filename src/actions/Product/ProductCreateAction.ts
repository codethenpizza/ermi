import {NextFunction, Request, Response} from 'express';
// @ts-ignore
import {Action} from "@types/types";


class ProductCreateAction implements Action {
    async handle(req: Request<{}, {}, {}, {}>, res: Response) {
        // const resp = await ProductModel.create(req.query);
        // res.send(resp);
    }

    assert(req: Request<{}, {}, {}, {}>, res: Response, next: NextFunction): void {
        // if(req.query.title && req.query.desc && req.query.cost) {
        //     next();
        // } else {
        //     res.send(`error: ${JSON.stringify(req.query)}`);
        // }
    }

    get action() {
        return [this.assert, this.handle];
    }
}

export default new ProductCreateAction();
