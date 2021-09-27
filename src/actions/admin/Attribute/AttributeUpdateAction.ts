import {NextFunction, Request, Response} from "express";
import {Action} from "@projTypes/action";
import Attribute, {IAttribute} from "@models/Attribute.model";
import {catchError} from "@actions/admin/Attribute/helper";

type ReqParams = {
    id: string;
};

export class AttributeUpdateAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number query param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, IAttribute, any>, res: Response) {
        try {
            const attrData = req.body;
            const id = parseInt(req.params.id);
            const attr = await Attribute.update(attrData, {where: {id}});
            const isUpdated = !!attr[0];
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
