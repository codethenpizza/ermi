import {NextFunction, Request, Response} from 'express';
// @ts-ignore
import {Action} from "@types/types";


class ProductReadAction implements Action {
    async handle(req: Request, res: Response) {
        // const resp = await ProductModel.find();
        res.send('resp');
    }

    assert(req: Request, res: Response, next: NextFunction): void {
        next();
    }

    get action() {
        return [this.assert, this.handle];
    }
}

export default new ProductReadAction();
