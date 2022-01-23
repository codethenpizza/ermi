import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {ICreateOrderData} from "@core/services/order/types";
import {setUser} from "../../../middlewares/auth";
import {orderUseCases} from "@core/useCases";


export class OrderCalculateAction extends Action {

    constructor(
        private _orderUseCases = orderUseCases
    ) {
        super();
    }

    get action() {
        return [setUser, ...super.action];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, ICreateOrderData, any>, res: Response) {
        const result = await this._orderUseCases.calculate(req.body);
        res.send(result);
    }

}
