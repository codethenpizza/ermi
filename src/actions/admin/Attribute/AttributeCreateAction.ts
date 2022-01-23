import {NextFunction, Request, Response} from "express";
import Attribute, {IAttribute} from "@core/models/Attribute.model";
import {Action} from "@actions/Action";
import {catchError} from "@actions/admin/Attribute/helper";

export class AttributeCreateAction extends Action {

    assert(req: Request<any, any, IAttribute, any>, res: Response, next: NextFunction) {
        const {name, type_id} = req.body;
        if (name?.length && type_id) {
            next();
        } else {
            res.status(400).send({error: 'name and type_id are required params'});
        }
    }

    async handle(req: Request<any, any, IAttribute, any>, res: Response) {
        try {
            const attr = new Attribute(req.body);
            await attr.save();
            res.send(attr);
        } catch (e) {
            catchError(e, res);
        }
    }
}
