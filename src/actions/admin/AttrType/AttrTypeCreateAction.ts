import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import AttrType from "@core/models/AttrType.model";

type ReqBody = {
    type: string;
};

export class AttrTypeCreateAction extends Action {


    assert(req: Request<any, any, ReqBody, any>, res: Response, next: NextFunction) {
        const {type} = req.body;
        if (type) {
            next();
        } else {
            res.status(400).send({error: 'type is required param'});
        }
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const {type} = req.body;
            const model = new AttrType({type});
            await model.save();
            res.send(model);
        } catch (error) {
            res.status(400).send({error});
        }
    }
}
