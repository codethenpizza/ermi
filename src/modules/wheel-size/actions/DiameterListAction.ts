import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {WheelSizeApi} from "../index";
import {ParamsPair} from "../types";
import {DISK_BOLTS_COUNT, DISK_BOLTS_SPACING, DISK_DIAMETER, DISK_ET, DISK_WIDTH} from "../../suppliers/types";
import slugify from "slugify";

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
