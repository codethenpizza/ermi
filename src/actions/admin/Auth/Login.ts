import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {AuthService} from "@core/services/AuthService";
import {IUser} from "@models/User.model";

export class Login implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body: {email, password}}: Request<any, any, Partial<IUser>, any>, res: Response) {
        try {
            const resp = await AuthService.loginAdmin(email, password);
            res.setHeader('authorization', resp.token)
            res.status(200).json(resp);
        } catch (e) {
            console.log(e);
            res.status(400).send((e as Error).message);
        }
    }

}
