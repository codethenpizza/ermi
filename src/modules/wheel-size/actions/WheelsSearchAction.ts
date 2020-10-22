import {Action} from "@projTypes/action";
import {NextFunction, Response, Request} from "express";
import {WheelSizeApi} from "../index";
import {EsReqFilter} from "@actions/front/Product/ProductElasticSearchAction";
import {DISK_DIAMETER, DISK_ET, DISK_WIDTH} from "../../suppliers/types";
import slugify from "slugify";

type ReqBody = {
    make: string;
    year: string;
    model: string;
}

export class WheelsSearchAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, ReqBody, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body: {make, year, model}}: Request<any, any, ReqBody, any>, res: Response) {
        const apiResp = await WheelSizeApi.searchByModel(make, year, model);

        console.log('apiResp', JSON.stringify(apiResp));

        const filters: EsReqFilter[][] = [];
        apiResp.forEach((item) => {

            const variants: EsReqFilter[][] = item.wheels.map(({front: {rim_diameter, rim_width, rim_offset}}) => {
                if (!rim_diameter || !rim_offset || !rim_width) {
                    return [];
                }
                return [
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
                    }
                ]
            });
            filters.push(...variants);
        });

        res.send(filters);
    }
}
