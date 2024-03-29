import {NextFunction, Request, Response} from "express";
import {Action} from "@actions/Action";
import ProductVariant, {IProductVariant} from "@core/models/ProductVariant.model";

type ReqParams = {
    id: string;
};

export class ProductVariantUpdateAction extends Action {


    assert(req: Request<ReqParams, any, IProductVariant, any>, res: Response, next: NextFunction) {
        // const {product_id, price} = req.body;
        // if (!product_id && !price) {
        //     res.status(400).send({error: 'product_id and price are required params'});
        // } else {
        next()
        // }
    }

    async handle(req: Request<ReqParams, any, IProductVariant, any>, res: Response) {
        const id = parseInt(req.params.id);
        try {
            const updateResult = await ProductVariant.update(req.body, {
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
