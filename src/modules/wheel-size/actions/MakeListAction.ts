import {Action} from "@projTypes/action";
import {NextFunction, Response, Request} from "express";
import {WheelSizeApi} from "../index";

export class MakeListAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const list = await WheelSizeApi.getMakes();
            res.send(list);
        } catch (e) {
            console.log(e);
            res.send(e);
        }
    }
}
