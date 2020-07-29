import {NextFunction, Response, Request} from "express";

import {Action} from "@projTypes/action";
import AttrType from "@models/AttrType.model";

class AttrTypeListAction extends Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const attrs = await AttrType.findAll();
            res.send(attrs);
        } catch (error) {
            res.status(400).send({error});
        }
    }
}

export default new AttrTypeListAction();
