import {NextFunction, Request, Response} from "express";
import Product from "@core/models/Product.model";
import {Action} from "@actions/Action";
import ProductVariant from "@core/models/ProductVariant.model";
import AttrValue from "@core/models/AttrValue.model";
import Attribute from "@core/models/Attribute.model";
import Image from "@core/models/Image.model";

type ReqParams = {
    id: string;
};

export class ProductGetAction extends Action {


    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number query param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const model = await Product.findOne({
                where: {id}, include: [
                    {model: ProductVariant, include: [{model: AttrValue, include: [Attribute]}, Image]}
                ]
            });
            if (model instanceof Product) {
                res.send(model);
            } else {
                res.status(400).send({error: `product with id=${id} not found`});
            }
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
