import {NextFunction, Request} from "express";
import User, {UserI} from "@models/User.model";
import {Action} from "@projTypes/action";


class UserCreateAction extends Action {

    assert(req: Request<any, any, any, any>, res, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res) {
        const userData: UserI = {email: 'dsa', password: 'wqe', name: 'trefsda', is_admin: false};
        const user = new User(userData);
        await user.save();
        res.send(user);
    }

    get action() {
        return [this.assert, this.handle];
    }

}
export default new UserCreateAction();
