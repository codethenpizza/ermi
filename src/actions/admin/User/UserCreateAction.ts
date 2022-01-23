import {NextFunction, Request} from "express";
import User, {IUser} from "@core/models/User.model";
import {Action} from "@actions/Action";
import {isAuth} from "../../../middlewares/auth";

export class UserCreateAction extends Action {

    get action() {
        return [isAuth, ...super.action];
    }

    assert(req: Request<any, any, any, any>, res, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res) {
        const userData: IUser = {email: 'dsa', phone: '1234567890', password: 'wqe', name: 'trefsda', is_admin: false};
        const user = new User(userData);
        await user.save();
        res.send(user);
    }

}
