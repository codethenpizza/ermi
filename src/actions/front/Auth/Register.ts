import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {AuthService} from "@core/services/AuthService";
import {UserI} from "@models/User.model";

export class Register implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body}: Request<any, any, Partial<UserI>, any>, res: Response) {
        try {
            const resp = await AuthService.register(body)
            res.send(resp);
        } catch (e) {
            res.status(400).send((e as Error).message);
        }
    }

}
