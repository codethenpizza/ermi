import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {IUser} from "@core/models/User.model";
import {isAuth} from "../../middlewares/auth";

export class User extends Action {

    get action() {
        return [isAuth, ...super.action];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({user}: Request<any, any, Partial<IUser>, any>, res: Response) {
        res.send(user);
    }

}
