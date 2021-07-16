import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {IUser} from "@models/User.model";
import {isAuth} from "../../../middlewares/auth";
import Order from "@models/Order.model";
import {JWTPayload} from "@core/services/AuthService";

export class OrderHistoryAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({user}: Request<any, any, Partial<IUser>, any>, res: Response) {
        const orders = await Order.findAll({
            where: {user_id: (user as JWTPayload).user.id},
            include: Order.fullIncludes()
        });
        res.send(orders);
    }

}
