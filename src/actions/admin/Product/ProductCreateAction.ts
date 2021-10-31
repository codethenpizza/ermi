import {NextFunction, Request, Response} from "express";
import Product, {IProduct} from "@models/Product.model";
import {Action} from "@projTypes/action";
import {isAuth} from "../../../middlewares/auth";


export class ProductCreateAction implements Action{
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, IProduct, any>, res: Response, next: NextFunction) {
        const {name, variants} = req.body;
        if (name.length && variants.length) {
            next();
        } else {
            res.status(400).send({error: 'name and productVariant are required params'});
        }
    }

    async handle(req: Request<any, any, IProduct, any>, res: Response) {
        try {
            const product = await Product.createWR(req.body);
            res.send(product);
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
