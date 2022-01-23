import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import PaymentStrategy from "@core/models/PaymentStrategy.model";
import ShippingType from "@core/models/ShippingType.model";

export class OrderShippingListAction extends Action {

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        const list = await ShippingType.findAll({include: [PaymentStrategy]});
        res.send(list);
    }

}
