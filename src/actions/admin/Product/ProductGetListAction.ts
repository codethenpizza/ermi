import {NextFunction, Request, Response} from "express";
import Product from "@core/models/Product.model";
import {Action} from "@actions/Action";
import ProductVariant from "@core/models/ProductVariant.model";
import AttrValue from "@core/models/AttrValue.model";
import Attribute from "@core/models/Attribute.model";
import Image from "@core/models/Image.model";

type QueryParams = {
    limit: string;
    offset: string;
};

export class ProductGetListAction extends Action {


    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({query: {limit = '20', offset = '0'}}: Request<any, any, any, QueryParams>, res: Response) {
        try {
            const model = await Product.findAndCountAll({
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['id', 'DESC']],
                include: [
                    {model: ProductVariant, include: [{model: AttrValue, include: [Attribute]}, Image]}
                ],
                distinct: true
            });
            res.send(model);
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
