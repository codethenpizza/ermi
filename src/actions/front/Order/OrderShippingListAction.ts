import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import PaymentStrategy from "@models/PaymentStrategy.model";
import ShippingType from "@models/ShippingType.model";

export class OrderShippingListAction implements Action {

    get action() {
        return [this.assert, this.handle.bind(this)];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        const list = await ShippingType.findAll({include: [PaymentStrategy]});
        res.send(list);
    }

}
