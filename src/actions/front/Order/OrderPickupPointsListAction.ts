import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import ShippingType from "@models/ShippingType.model";
import PaymentStrategy from "@models/PaymentStrategy.model";
import PickupPoint from "@models/PickupPoint.model";
import Address from "@models/Address.model";

export class OrderPickupPointsListAction implements Action {

    get action() {
        return [this.assert, this.handle.bind(this)];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        const list = await PickupPoint.findAll({include: [Address]});
        res.send(list);
    }

}
