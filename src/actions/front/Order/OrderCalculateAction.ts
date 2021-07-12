import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {OrderService} from "@core/services/order/OrderService";
import {CreateOrderData} from "@core/services/order/types";

export class OrderCalculateAction implements Action {

    orderService = new OrderService();

    get action() {
        return [this.assert, this.handle.bind(this)];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, CreateOrderData, any>, res: Response) {
        const result = await this.orderService.calculateOrder(req.body);
        res.send(result);
    }

}
