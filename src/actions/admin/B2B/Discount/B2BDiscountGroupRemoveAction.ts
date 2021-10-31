import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import B2BDiscountGroup from "@models/B2BDiscountGroup.model";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import {isAuth} from "../../../../middlewares/auth";

type ReqParams = {
    id: string;
};

export class B2BDiscountGroupRemoveAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id, 10))) {
            res.status(400).send('ID is required');
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        const transaction = await B2BDiscountGroup.sequelize.transaction();

        try {
            const id = parseInt(req.params.id, 10);
            await B2BDiscountService.deleteDiscountGroup(id, transaction);
            await transaction.commit();
            res.send();
        } catch (e) {
            await transaction.rollback();
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
