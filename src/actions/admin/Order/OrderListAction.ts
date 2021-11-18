import {NextFunction, Request, Response} from "express";
import {Action} from "@projTypes/action";
import Order from "@models/Order.model";
import {isAuth} from "../../../middlewares/auth";

export class OrderListAction implements Action {

    constructor() {
    }

    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        const list = await Order.findAll({
            include: Order.fullIncludes()
        });

        res.send(list);
    }
}
