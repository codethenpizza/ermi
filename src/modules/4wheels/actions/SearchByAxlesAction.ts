import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import {SearchByAxlesParams} from "../useCases/FourWheelsCatalogUseCases/types";
import {fourWheelsCatalogUseCases} from "../useCases";

export class SearchByAxlesAction extends Action {

    constructor(
        private _fourWheelsCatalogUseCases = fourWheelsCatalogUseCases
    ) {
        super();
    }

    get action() {
        return [this.assert.bind(this), this.handle.bind(this)];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body}: Request<any, any, SearchByAxlesParams, any>, res: Response) {

        const data = await this._fourWheelsCatalogUseCases.searchByAxles(body);

        res.send(data);
    }
}
