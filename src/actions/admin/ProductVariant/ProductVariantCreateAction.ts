import {NextFunction, Request, Response} from "express";
import {Action} from "@actions/Action";
import ProductVariant, {IProductVariant} from "@core/models/ProductVariant.model";


export class ProductVariantCreateAction extends Action {


    assert(req: Request<any, any, IProductVariant, any>, res: Response, next: NextFunction) {
        // const {product_id, price} = req.body;
        // if (!product_id && !price) {
        //     res.status(400).send({error: 'product_id and price are required params'});
        // } else {
        next()
        // }
    }

    async handle(req: Request<any, any, IProductVariant, any>, res: Response) {
        try {
            const createdProductVariant = await ProductVariant.create(req.body);
            res.send(createdProductVariant);
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
