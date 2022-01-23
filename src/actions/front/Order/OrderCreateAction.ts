import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {ICreateOrderData} from "@core/services/order/types";
import {sequelizeTs} from "@core/database";
import {orderUseCases} from "@core/useCases";

export class OrderCreateAction extends Action {

    constructor(
        private _orderUseCases = orderUseCases
    ) {
        super();
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, ICreateOrderData, any>, res: Response) {
        const transaction = await sequelizeTs.transaction();

        try {
            const result = await this._orderUseCases.create(req.body, transaction);
            await transaction.commit();
            res.send(result);
        } catch (e) {
            await transaction.rollback();
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
