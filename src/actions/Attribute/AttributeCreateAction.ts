import {NextFunction, Request, Response} from "express";
import Attribute, {AttributeI} from "@models/Attribute.model";
import {Action} from "@projTypes/action";
import {catchError} from "@actions/Attribute/helper";

class AttributeCreateAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, AttributeI, any>, res: Response, next: NextFunction) {
        const {name, type_id} = req.body;
        if (name?.length && type_id) {
            next();
        } else {
            res.status(400).send({error: 'name and type_id are required params'});
        }
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const attrData: AttributeI = {...req.body};
            const attr = new Attribute(attrData);
            await attr.save();
            res.send(attr);
        } catch (e) {
            catchError(e, res);
        }
    }
}

export default new AttributeCreateAction();
