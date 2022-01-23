import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import Attribute from "@core/models/Attribute.model";

type ReqParams = {
    id: string;
};

export class AttributeDeleteAction extends Action {

    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const attr = await Attribute.destroy({where: {id}});
            if (!!attr) {
                res.status(204).send();
            } else {
                res.status(400).send({error: `attribute with id=${id} not found`});
            }
        } catch (error) {
            res.status(400).send({error});
        }
    }

}
