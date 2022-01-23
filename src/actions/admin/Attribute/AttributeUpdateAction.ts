import {NextFunction, Request, Response} from "express";
import {Action} from "@actions/Action";
import Attribute, {IAttribute} from "@core/models/Attribute.model";
import {catchError} from "@actions/admin/Attribute/helper";

type ReqParams = {
    id: string;
};

export class AttributeUpdateAction extends Action {

    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number query param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, IAttribute, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const attr = await Attribute.update(req.body, {where: {id}});
            const isUpdated = Boolean(attr[0]);
            if (isUpdated) {
                res.status(202).send();
            } else {
                res.status(400).send({error: `attribute with id=${id} not found`});
            }

        } catch (error) {
            catchError(error, res);
        }
    }

}
