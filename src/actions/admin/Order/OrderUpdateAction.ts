import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import Order from "@models/Order.model";
import {catchError} from "@actions/admin/Attribute/helper";

export class OrderUpdateAction implements Action {
    constructor() {
    }

    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        if (!req.params.id) {
            res.status(400).send({error: 'id is required param'});
        }
        if (!req.body) {
            res.status(400).send({error: 'order is required'});
        }

        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            // update only now, extend later
            const id = parseInt(req.params.id);
            const {status} = req.body
            const updateResult = await Order.update({status}, {where: {id: id}})
            const isUpdated = !!updateResult[0];
            if (isUpdated) {
                res.status(202).send();
            } else {
                res.status(400).send({error: `Can't update order with id ${id}`});
            }
        } catch (error) {
            catchError(error, res);
        }
    }
}
