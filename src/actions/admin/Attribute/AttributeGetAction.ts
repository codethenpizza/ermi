import {NextFunction, Request, Response} from "express";

import {Action} from "@actions/Action";
import Attribute from "@core/models/Attribute.model";
import AttrType from "@core/models/AttrType.model";

type ReqParams = {
    id: string;
};

export class AttributeGetAction extends Action {

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
            const attr = await Attribute.findOne({where: {id}, include: [AttrType]});
            if (attr instanceof Attribute) {
                res.send(attr);
            } else {
                res.status(400).send({error: `attribute with id=${id} not found`});
            }
        } catch (error) {
            res.status(400).send({error});
        }
    }

}
