import {NextFunction, Request, Response} from "express";

import {Action} from "@actions/Action";
import Attribute from "@core/models/Attribute.model";
import AttrSet from "@core/models/AttrSet.model";

export class AttrSetListAction extends Action {

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const attrs = await AttrSet.findAll({include: [Attribute]});
            res.send(attrs);
        } catch (error) {
            res.status(400).send({error});
        }
    }
}
