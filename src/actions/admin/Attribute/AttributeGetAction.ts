import {NextFunction, Request, Response} from "express";

import {Action} from "@projTypes/action";
import Attribute from "@models/Attribute.model";
import AttrType from "@models/AttrType.model";
import {isAuth} from "../../../middlewares/auth";

type ReqParams = {
    id: string;
};

export class AttributeGetAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

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
