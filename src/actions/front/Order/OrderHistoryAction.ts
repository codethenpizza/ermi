import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {IUser} from "@core/models/User.model";
import {isAuth} from "../../../middlewares/auth";
import {IOrderResp} from "@core/services/order/types";
import {orderUseCases} from "@core/useCases";

export class OrderHistoryAction extends Action {

    constructor(
        private _orderUseCases = orderUseCases
    ) {
        super();
    }

    get action() {
        return [isAuth, ...super.action];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({user}: Request<any, any, Partial<IUser>, any>, res: Response<IOrderResp[]>) {
        try {
            // @ts-ignore
            const orders = await this._orderUseCases.getUserOrders(user.user as IUser);
            res.send(orders);
        } catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
