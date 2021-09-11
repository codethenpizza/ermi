import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {OrderService} from "@core/services/order/OrderService";
import {CreateOrderData} from "@core/services/order/types";
import Order from "@models/Order.model";

export class OrderCreateAction implements Action {

    orderService = new OrderService();

    get action() {
        return [this.assert, this.handle.bind(this)];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, CreateOrderData, any>, res: Response) {
        const transaction = await Order.sequelize.transaction();

        try {
            const result = await this.orderService.create(req.body, transaction);
            await transaction.commit();
            res.send(result);
        } catch (e) {
            await transaction.rollback();
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
