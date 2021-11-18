import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import User from "@models/User.model";
import {Op} from "sequelize";
import B2BDiscountGroup from "@models/B2BDiscountGroup.model";
import {isAuth} from "../../../../middlewares/auth";

export class B2BUserListAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        try {
            const users = await User.findAll({
                where: {b2b_discount_group_id: {[Op.not]: null}},
                include: [B2BDiscountGroup],
                attributes: {exclude: ['password']}
            });
            res.send(users);
        } catch (e) {
            console.error(e.message);
            res.status(400).send(e.message);
        }
    }

}
