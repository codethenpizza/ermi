import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {WheelSizeApi} from "../index";

type ReqBody = {
    make: string;
    year: string;
    model: string;
    generation: string;
    trim: string;
}

export class DiameterListAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, ReqBody, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body: {make, year, model, generation, trim}}: Request<any, any, ReqBody, any>, res: Response) {
        const apiResp = await WheelSizeApi.searchByModel(make, year, model);

        const diameters = apiResp.map(x => x.wheels.map(w => w.front.rim_diameter)).flat();

        res.send(Array.from(new Set(diameters)));
    }
}
