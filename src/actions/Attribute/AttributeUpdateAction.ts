import {NextFunction, Response, Request} from "express";

import {Action} from "@projTypes/action";
import Attribute, {AttributeI} from "@models/Attribute.model";
import {catchError} from "@actions/Attribute/helper";

type reqParams = {
    id: string;
};

class AttributeUpdateAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<reqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number query param'});
        } else {
            next();
        }
    }

    async handle(req: Request<reqParams, any, AttributeI, any>, res: Response) {
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

export default new AttributeUpdateAction();
