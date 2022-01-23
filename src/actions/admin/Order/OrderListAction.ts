import {NextFunction, Request, Response} from "express";
import {Action} from "@actions/Action";
import Order from "@core/models/Order.model";

export class OrderListAction extends Action {

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        const list = await Order.findAll({
            include: Order.getFullIncludes()
        });

        res.send(list);
    }
}
