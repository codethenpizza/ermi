import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import User, {IUser} from "@core/models/User.model";

type ReqParams = {
    id: string;
};

export class B2BUserUpdateAction extends Action {


    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(400).send('ID is required');
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, IUser, any>, res: Response<User>) {
        try {
            const id = req.body.id;
            let user = await User.findByPk(id);
            user = await user.update(req.body, {raw: true});
            res.send(user);
        } catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
