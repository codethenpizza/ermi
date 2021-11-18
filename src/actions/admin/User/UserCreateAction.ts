import {NextFunction, Request} from "express";
import User, {IUser} from "@models/User.model";
import {Action} from "@projTypes/action";
import {isAuth} from "../../../middlewares/auth";

class UserCreateAction extends Action {

    assert(req: Request<any, any, any, any>, res, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res) {
        const userData: IUser = {email: 'dsa', phone: '1234567890', password: 'wqe', name: 'trefsda', is_admin: false};
        const user = new User(userData);
        await user.save();
        res.send(user);
    }

    get action() {
        return [isAuth, this.assert, this.handle];
    }

}
export default new UserCreateAction();
