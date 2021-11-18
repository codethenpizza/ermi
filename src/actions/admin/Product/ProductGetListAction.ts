import {NextFunction, Request, Response} from "express";
import Product from "@models/Product.model";
import {Action} from "@projTypes/action";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import Attribute from "@models/Attribute.model";
import Image from "@models/Image.model";
import {isAuth} from "../../../middlewares/auth";

type QueryParams = {
    limit: string;
    offset: string;
};

export class ProductGetListAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

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
