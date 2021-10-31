import {NextFunction, Request, Response} from "express";
import {Action} from "@projTypes/action";
import AttrValue, {IAttrValue} from "@models/AttrValue.model";
import {isAuth} from "../../../middlewares/auth";


export class AttrValueCreateAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, IAttrValue, any>, res: Response, next: NextFunction) {
        const {product_variant_id, attr_id, value} = req.body;
        if (!product_variant_id && !attr_id && !value) {
            res.status(400).send({error: 'product_variant_id, attr_id and value are required params'});
        } else {
            next()
        }
    }

    async handle(req: Request<any, any, IAttrValue, any>, res: Response) {
        try {
            const createdAttrValue = await AttrValue.create(req.body);
            res.send(createdAttrValue);
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
