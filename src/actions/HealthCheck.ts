import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";

export class HealthCheck extends Action {

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    handle(req: Request<any, any, any, any>, res: Response) {
        res.send();
    }

}
