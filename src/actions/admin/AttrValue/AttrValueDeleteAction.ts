import {NextFunction, Request, Response} from "express";
import {Action} from "@projTypes/action";
import AttrValue from "@models/AttrValue.model";

type ReqParams = {
    id: string;
};

export class AttrValueDeleteAction implements Action {
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

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const isDeleted = await AttrValue.destroy({
                where: {id}
            });
            if (!!isDeleted) {
                res.status(202).send();
            } else {
                res.status(400).send({error: `attr with id=${id} not found`});
            }
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
