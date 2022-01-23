import {NextFunction, Request, Response} from "express";
import {IProduct} from "@core/models/Product.model";
import {Action} from "@actions/Action";


export class ProductCreateAction extends Action {

    assert(req: Request<any, any, IProduct, any>, res: Response, next: NextFunction) {
        const {name, variants} = req.body;
        if (name.length && variants.length) {
            next();
        } else {
            res.status(400).send({error: 'name and productVariant are required params'});
        }
    }

    async handle(req: Request<any, any, IProduct, any>, res: Response) {
        // try {
        //     const product = await Product.createWR(req.body);
        //     res.send(product);
        // } catch (error) {
        //     res.status(500).send({error});
        // }
    }
}
