import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {authService} from "@core/services";
import {IUserCreate} from "@core/models/User.model";

export class Register extends Action {

    constructor(
        private _authService = authService
    ) {
        super();
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body}: Request<any, any, IUserCreate, any>, res: Response) {
        try {
            const resp = await this._authService.register(body);
            res.send(resp);
        } catch (e) {
            res.status(400).send((e as Error).message);
        }
    }

}
