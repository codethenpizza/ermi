import {NextFunction, Request, Response} from "express";

import {Action} from "@actions/Action";
import Attribute from "@core/models/Attribute.model";
import AttrSet from "@core/models/AttrSet.model";

type ReqParams = {
    id: string;
};

export class AttrSetGetAction extends Action {

    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number query param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const attr = await AttrSet.findOne({where: {id}, include: [Attribute]});
            if (attr instanceof AttrSet) {
                res.send(attr);
            } else {
                res.status(400).send({error: `attribute set with id=${id} not found`});
            }
        } catch (error) {
            res.status(400).send({error});
        }
    }

}
