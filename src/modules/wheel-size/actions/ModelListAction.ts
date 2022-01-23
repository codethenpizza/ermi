import {Action} from "@actions/Action";
import {NextFunction, Response, Request} from "express";
import {WheelSizeApi} from "../index";

type ReqBody = {
    year: string;
    make: string;
}

export class ModelListAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, ReqBody, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body}: Request<any, any, ReqBody, any>, res: Response) {
        const list = await WheelSizeApi.getModels(body.make, body.year);
        res.send(list);
    }
}
