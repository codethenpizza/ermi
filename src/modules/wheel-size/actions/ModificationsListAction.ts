import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {WheelSizeApi} from "../index";

type ReqBody = {
    make: string;
    year: string;
    model: string;
    generation: string;
}

export class ModificationsListAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body: {make, generation, model, year}}: Request<any, any, ReqBody, any>, res: Response) {
        const apiResp = await WheelSizeApi.searchByModel(make, year, model);

        const mods = apiResp.filter(x => x.generation.name === generation)?.map(({trim}) => trim);

        res.send(Array.from(new Set(mods)));
    }

}
