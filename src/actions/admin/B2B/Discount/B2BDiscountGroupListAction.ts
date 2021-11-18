import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import B2BDiscountGroup from "@models/B2BDiscountGroup.model";
import B2BDiscount from "@models/B2BDiscount.model";
import {isAuth} from "../../../../middlewares/auth";

export class B2BDiscountGroupListAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response<B2BDiscountGroup[]>) {
        const discountGroups = await B2BDiscountGroup.findAll({include: [B2BDiscount]});
        res.send(discountGroups);
    }

}
