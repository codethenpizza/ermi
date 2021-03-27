import {Action} from "@projTypes/action";
import {NextFunction, Response, Request} from "express";
import {WheelSizeApi} from "../index";
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
        const filtersDataSet = new Set();
        apiResp
            .filter((item) => item.trim === trim && item.generation.name === generation)
            .forEach((item) => {

                const variants: ParamsPair[] = item.wheels
                    .map(({front: {rim_diameter, rim_width, rim_offset}}) => {
                        if (!rim_diameter || !rim_offset || !rim_width) {
                            return null;
                        }

                        const dataString = '' + rim_diameter + rim_offset + rim_width + item.stud_holes + item.pcd;

                        if (filtersDataSet.has(dataString)) {
                            return null;
                        } else {
                            filtersDataSet.add(dataString);
                        }

                        return {
                            boltsCount: item.stud_holes,
                            boltsSpacing: item.pcd,
                            et: rim_offset,
                            width: rim_width,
                            diameter: rim_diameter,
                            esFilters: [[
                                {
                                    key: WheelsSearchAction.generateAttrKey(DISK_DIAMETER),
                                    value: rim_diameter,
                                },
                                {
                                    key: WheelsSearchAction.generateAttrKey(DISK_WIDTH),
                                    value: rim_width,
                                },
                                {
                                    key: WheelsSearchAction.generateAttrKey(DISK_ET),
                                    value: rim_offset,
                                },
                                {
                                    key: WheelsSearchAction.generateAttrKey(DISK_BOLTS_COUNT),
                                    value: item.stud_holes,
                                },
                                {
                                    key: WheelsSearchAction.generateAttrKey(DISK_BOLTS_SPACING),
                                    value: item.pcd,
                                }
                            ]]
                        } as ParamsPair;
                    }).filter(x => !!x);
                filters.push(...variants);
            });

        res.send(filters);
    }

    private static generateAttrKey(name: string): string {
        return `attrs.${slugify(name, {lower: true})}.value`
    }
}
