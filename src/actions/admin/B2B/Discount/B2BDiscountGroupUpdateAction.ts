import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {IB2BDiscountGroup} from "@models/B2BDiscountGroup.model";
import B2BDiscount from "@models/B2BDiscount.model";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import {isAuth} from "../../../../middlewares/auth";

type ReqParams = {
    id: string;
};

export class B2BDiscountGroupUpdateAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

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
            const id = parseInt(req.params.id, 10);
            const discount = await B2BDiscountService.updateDiscountGroup(id, req.body, transaction);
            transaction.commit();
            res.send(discount);
        } catch (e) {
            transaction.rollback();
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
