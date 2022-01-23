import {NextFunction, Request, Response} from "express";

import {Action} from "@actions/Action";
import AttrType from "@core/models/AttrType.model";

export class AttrTypeListAction extends Action {


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
