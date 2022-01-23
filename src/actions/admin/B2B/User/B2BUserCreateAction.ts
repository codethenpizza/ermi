import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {IUser} from "@core/models/User.model";

export class B2BUserCreateAction extends Action {


    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, IUser, any>, res: Response) {
        try {
            // const userData: IUser = req.body;
            // const user = await AuthService.register(userData)
            // res.send(user);
        } catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
