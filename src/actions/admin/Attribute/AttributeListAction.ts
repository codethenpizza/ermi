import {NextFunction, Response, Request} from "express";

import {Action} from "@projTypes/action";
import Attribute from "@models/Attribute.model";
import AttrType from "@models/AttrType.model";

export class AttributeListAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const attrs = await Attribute.findAll({include: [AttrType]});
            res.send(attrs);
        } catch (error) {
            res.status(400).send({error});
        }
    }
}
