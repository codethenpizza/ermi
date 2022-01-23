import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {setUser} from "../../../middlewares/auth";
import {catalogUseCases} from "@core/useCases";

export class ProductElasticGetAction extends Action {

    constructor(
        private _catalogUseCases = catalogUseCases
    ) {
        super();
    }

    get action() {
        return [setUser, ...super.action];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<{ id: string }, any, any, any>, res: Response) {
        try {
            const product = await this._catalogUseCases.get(req.params.id, req.user);
            if (product) {
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
