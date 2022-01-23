import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import B2BDiscountGroup from "@core/models/B2BDiscountGroup.model";

type ReqParams = {
    id: string;
};

export class B2BDiscountGroupRemoveAction extends Action {


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
            // const id = parseInt(req.params.id, 10);
            // await B2BDiscountService.deleteDiscountGroup(id, transaction);
            // await transaction.commit();
            res.send();
        } catch (e) {
            await transaction.rollback();
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
