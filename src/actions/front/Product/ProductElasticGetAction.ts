import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {EsProduct} from "@server/elastic/EsProducts";
import {setUser} from "../../../middlewares/auth";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import {EsProductVariant} from "@actions/front/types";
import {JWTPayload} from "@core/services/AuthService";

export class ProductElasticGetAction implements Action {
    get action() {
        return [setUser, this.assert.bind(this), this.handle.bind(this)];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<{ id: string }, any, any, any>, res: Response) {
        const esProduct = new EsProduct();
        try {
            const resp = await esProduct.es.get(req.params.id);
            if (resp) {
                let product = resp.body._source;
                const JWTPayload: JWTPayload = req.user as JWTPayload;
                if (JWTPayload?.user) {
                    product = await B2BDiscountService.enrichESProductByB2BUserDiscount(JWTPayload.user, product) as EsProductVariant;
                }
                res.send(product);
            } else {
                res.status(404).send();
            }
        } catch (error) {
            console.log('ERROR', error);
            res.send({error});
        }

    }

}
