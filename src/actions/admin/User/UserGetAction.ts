import {NextFunction, Request} from "express";
import User from "@core/models/User.model";
import {Action} from "@actions/Action";

export class UserGetAction extends Action {

    assert(req: Request<any, any, any, any>, res, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, { id: string }>, res) {
        const user = await User.findByPk(parseInt(req.query.id), {attributes: {exclude: ['password']}});
        res.send(user);
    }

}
