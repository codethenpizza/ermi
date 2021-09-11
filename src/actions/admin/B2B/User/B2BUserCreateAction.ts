import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {IUser} from "@models/User.model";
import {AuthService} from "@core/services/AuthService";

export class B2BUserCreateAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, IUser, any>, res: Response) {
        try {
            const userData: IUser = req.body;
            const user = await AuthService.register(userData)
            res.send(user);
        } catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
