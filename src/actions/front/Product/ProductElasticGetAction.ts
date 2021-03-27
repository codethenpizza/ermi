import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {EsProduct} from "@server/elastic/EsProducts";

export class ProductElasticGetAction implements Action {
    get action() {
        return [this.assert.bind(this), this.handle.bind(this)];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<{ id: string }, any, any, any>, res: Response) {
        const esProduct = new EsProduct();
        try {
            const resp = await esProduct.es.get(req.params.id);
            if (resp) {
                res.send(resp.body._source);
            } else {
                res.status(404).send();
            }
        } catch (error) {
            console.log('ERROR', error);
            res.send({error});
        }

    }

}
