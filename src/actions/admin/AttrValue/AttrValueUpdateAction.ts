import {NextFunction, Request, Response} from "express";
import {Action} from "@actions/Action";
import AttrValue, {IAttrValue} from "@core/models/AttrValue.model";

type ReqParams = {
    id: string;
};

export class AttrValueUpdateAction extends Action {


    assert(req: Request<ReqParams, any, IAttrValue, any>, res: Response, next: NextFunction) {
        const {product_variant_id, attr_id, value} = req.body;
        if (!product_variant_id && !attr_id && !value) {
            res.status(400).send({error: 'product_variant_id, attr_id and value are required params'});
        } else {
            next()
        }
    }

    async handle(req: Request<ReqParams, any, IAttrValue, any>, res: Response) {
        const id = parseInt(req.params.id);
        try {
            const updateResult = await AttrValue.update(req.body, {
                where: {id}
            });
            const isUpdated = !!updateResult[0];
            if (isUpdated) {
                res.status(202).send();
            } else {
                res.status(400).send({error: `product with id=${id} not found`});
            }
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
