import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import B2BDiscount from "@models/B2BDiscount.model";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import B2BDiscountGroup, {IB2BDiscountGroup} from "@models/B2BDiscountGroup.model";
import {isAuth} from "../../../../middlewares/auth";

export class B2BDiscountGroupCreateAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, B2BDiscountGroup, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, B2BDiscountGroup, any>, res: Response<IB2BDiscountGroup>) {
        const transaction = await B2BDiscount.sequelize.transaction();
        try {
            const discountGroup = await B2BDiscountService.createDiscountGroup(req.body, transaction);
            await transaction.commit();
            res.send(discountGroup);
        } catch (e) {
            await transaction.rollback();
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
