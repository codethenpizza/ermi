import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {IUser} from "@models/User.model";
import {isAuth} from "../../middlewares/auth";

export class User implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({user}: Request<any, any, Partial<IUser>, any>, res: Response) {
        res.send(user);
    }

}
