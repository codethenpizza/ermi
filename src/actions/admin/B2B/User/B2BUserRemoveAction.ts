import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import User from "@models/User.model";
import {isAuth} from "../../../../middlewares/auth";

type ReqParams = {
    id: string;
};

export class B2BUserRemoveAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(400).send('ID is required');
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id, 10);
            await User.destroy({where: {id}});
            res.send();
        } catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
