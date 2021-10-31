import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import User, {IUser} from "@models/User.model";
import {isAuth} from "../../../../middlewares/auth";

type ReqParams = {
    id: string;
};

export class B2BUserUpdateAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

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
