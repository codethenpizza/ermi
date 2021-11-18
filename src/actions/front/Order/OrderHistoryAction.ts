import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {IUser, IUserJWTPayload} from "@models/User.model";
import {isAuth} from "../../../middlewares/auth";
import {JWTPayload} from "@core/services/AuthService";
import {OrderService} from "@core/services/order/OrderService";
import {OrderResp} from "@core/services/order/types";

export class OrderHistoryAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({user}: Request<any, any, Partial<IUser>, any>, res: Response<OrderResp[]>) {
        try {
            const orderService = new OrderService();
            const JWTPayload = user as JWTPayload<IUserJWTPayload>;
            const orders = await orderService.getUserOrders(JWTPayload.user);
            res.send(orders);
        } catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
