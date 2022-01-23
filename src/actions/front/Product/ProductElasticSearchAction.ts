import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {setUser} from "../../../middlewares/auth";
import {catalogUseCases} from "@core/useCases";
import {Elastic} from "@core/services/elastic/types";

export class ProductElasticSearchAction extends Action {

    constructor(
        private _catalogUseCases = catalogUseCases
    ) {
        super();
    }

    get action() {
        return [setUser, ...super.action];
    }

    assert(req: Request<any, any, Elastic.SearchParams, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body, user}: Request<any, any, Elastic.SearchParams, any>, res: Response) {
        try {
            const products = await this._catalogUseCases.search(body, user);
            res.send(products);
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
