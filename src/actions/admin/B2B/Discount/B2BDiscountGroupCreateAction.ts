import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import B2BDiscount from "@core/models/B2BDiscount.model";
import B2BDiscountGroup, {IB2BDiscountGroup} from "@core/models/B2BDiscountGroup.model";

export class B2BDiscountGroupCreateAction extends Action {


    assert(req: Request<any, any, B2BDiscountGroup, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, B2BDiscountGroup, any>, res: Response<IB2BDiscountGroup>) {
        const transaction = await B2BDiscount.sequelize.transaction();
        try {
            // const discountGroup = await B2BDiscountService.createDiscountGroup(req.body, transaction);
            // await transaction.commit();
            // res.send(discountGroup);
        } catch (e) {
            await transaction.rollback();
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
