import {NextFunction, Request, Response} from "express";

import {Action} from "@projTypes/action";
import AttrType from "@models/AttrType.model";
import {isAuth} from "../../../middlewares/auth";

export class AttrTypeListAction extends Action {
    get action() {
        return [isAuth, this.assert, this.handle];
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
