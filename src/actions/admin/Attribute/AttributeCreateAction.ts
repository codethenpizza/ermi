import {NextFunction, Request, Response} from "express";
import Attribute, {IAttribute} from "@models/Attribute.model";
import {Action} from "@projTypes/action";
import {catchError} from "@actions/admin/Attribute/helper";

export class AttributeCreateAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, IAttribute, any>, res: Response, next: NextFunction) {
        const {name, type_id} = req.body;
        if (name?.length && type_id) {
            next();
        } else {
            res.status(400).send({error: 'name and type_id are required params'});
        }
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const attrData: IAttribute = {...req.body};
            const attr = new Attribute(attrData);
            await attr.save();
            res.send(attr);
        } catch (e) {
            catchError(e, res);
        }
    }
}
