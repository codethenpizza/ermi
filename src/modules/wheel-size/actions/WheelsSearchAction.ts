import {Action} from "@projTypes/action";
import {NextFunction, Response, Request} from "express";
import {WheelSizeApi} from "../index";
import {EsReqFilter} from "@actions/front/Product/ProductElasticSearchAction";
import {DISK_BOLTS_COUNT, DISK_BOLTS_SPACING, DISK_DIAMETER, DISK_ET, DISK_WIDTH} from "../../suppliers/types";
import slugify from "slugify";
import {ParamsPair} from "../types";

type ReqBody = {
    make: string;
    year: string;
    model: string;
    generation: string;
    trim: string;
}

export class WheelsSearchAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, ReqBody, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body: {make, year, model, generation, trim}}: Request<any, any, ReqBody, any>, res: Response) {
        const apiResp = await WheelSizeApi.searchByModel(make, year, model);

        const filters: ParamsPair[] = [];
        apiResp
            .filter((item) => item.trim === trim && item.generation.name === generation)
            .forEach((item) => {

            const variants: ParamsPair[] = item.wheels
                .map(({front: {rim_diameter, rim_width, rim_offset}}) => {
                if (!rim_diameter || !rim_offset || !rim_width) {
                    return null;
                }
                return {
                    boltsCount: item.stud_holes,
                    boltsSpacing: item.pcd,
                    et: rim_offset,
                    width: rim_width,
                    diameter: rim_diameter,
                    esFilters: [[
                        {
                            name: slugify(DISK_DIAMETER, {lower: true}),
                            value: rim_diameter
                        },
                        {
                            name: slugify(DISK_WIDTH, {lower: true}),
                            value: rim_width
                        },
                        {
                            name: slugify(DISK_ET, {lower: true}),
                            value: rim_offset
                        },
                        {
                            name: slugify(DISK_BOLTS_COUNT, {lower: true}),
                            value: item.stud_holes
                        },
                        {
                            name: slugify(DISK_BOLTS_SPACING, {lower: true}),
                            value: item.pcd
                        }
                    ]]
                };
            }).filter(x => !!x);
            filters.push(...variants);
        });

        res.send(filters);
    }
}
