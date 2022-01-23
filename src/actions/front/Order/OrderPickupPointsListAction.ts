import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import PickupPoint from "@core/models/PickupPoint.model";
import Address from "@core/models/Address.model";

export class OrderPickupPointsListAction extends Action {

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        const list = await PickupPoint.findAll({include: [Address]});
        res.send(list);
    }

}
