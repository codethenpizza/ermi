import {NextFunction, Request, Response} from "express";
import Product from "@models/Product.model";
import {Action} from "@projTypes/action";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import Attribute from "@models/Attribute.model";
import Image from "@models/Image.model";
import Order from "@models/Order.model";

export class OrderListAction implements Action {

    constructor() {
    }

    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        const list = await Order.findAll({
            include: Order.fullIncludes()
        });

        res.send(list);
    }
}
