import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {authService} from "@core/services";
import {IUser} from "@core/models/User.model";

export class Login extends Action {

    constructor(
        private _authService = authService
    ) {
        super();
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body: {email, password}}: Request<any, any, Partial<IUser>, any>, res: Response) {
        try {
            const resp = await this._authService.login(email, password);
            res.status(200).json(resp);
        } catch (e) {
            console.log(e);
            res.status(400).send((e as Error).message);
        }
    }

}
