import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";

export class HealthCheck implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    handle(req: Request<any, any, any, any>, res: Response) {
        res.send();
    }

}
