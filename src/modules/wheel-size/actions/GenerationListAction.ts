import {Action} from "@actions/Action";
import {NextFunction, Response, Request} from "express";
import {WheelSizeApi} from "../index";

type ReqBody = {
    make: string;
    year: string;
    model: string;
}

export class GenerationListAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body: {make, year, model}}: Request<any, any, ReqBody, any>, res: Response) {
        const apiResp = await WheelSizeApi.searchByModel(make, year, model);

        const gens = apiResp.map(({generation: {name}}) => name);
        res.send(Array.from(new Set(gens)));
    }

}
