import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import User from "@core/models/User.model";

type ReqParams = {
    id: string;
};

export class B2BUserRemoveAction extends Action {


    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(400).send('ID is required');
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id, 10);
            await User.destroy({where: {id}});
            res.send();
        } catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
