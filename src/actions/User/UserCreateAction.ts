import {NextFunction, Request} from "express";
import User from "@models/User.model";
// @ts-ignore
import {Action} from "@types/types";



class UserCreateAction extends Action {

    assert(req: Request<any, any, any, any>, res, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res) {
        const user = new User({email: 'dsa', password: 'wqe', name: 'trefsda', isAdmin: false});
        await user.save();
        res.send(user);
    }

    get action() {
        return [this.assert, this.handle];
    }

}
export default new UserCreateAction();
