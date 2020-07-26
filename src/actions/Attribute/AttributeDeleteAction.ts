import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import Attribute from "@models/Attribute.model";

type reqParams = {
    id: string;
};

class AttributeDeleteAction extends Action {
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

    async handle(req: Request<reqParams, any, any, any>, res: Response) {
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

export default new AttributeDeleteAction();
