import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {IB2BDiscountGroup} from "@core/models/B2BDiscountGroup.model";
import B2BDiscount from "@core/models/B2BDiscount.model";

type ReqParams = {
    id: string;
};

export class B2BDiscountGroupUpdateAction extends Action {


    assert(req: Request<ReqParams, any, IB2BDiscountGroup, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(400).send('ID is required');
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, IB2BDiscountGroup, any>, res: Response<IB2BDiscountGroup>) {
        const transaction = await B2BDiscount.sequelize.transaction();

        try {
            // const id = parseInt(req.params.id, 10);
            // const discount = await B2BDiscountService.updateDiscountGroup(id, req.body, transaction);
            // transaction.commit();
            // res.send(discount);
        } catch (e) {
            transaction.rollback();
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
