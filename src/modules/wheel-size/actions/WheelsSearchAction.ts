import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {WheelSizeApi} from "../index";
import slugify from "slugify";
import {SearchRespBodyItem} from "../types";
import {RIM_DIAMETER, RIM_ET, RIM_PCD, RIM_WIDTH} from "../../suppliers/helpers/rimProductType/rimTypes";

interface ReqBody {
    make: string;
    year: string;
    model: string;
    generation: string;
    trim: string;
    diameters: number[];
}

export class WheelsSearchAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    private static generateAttrKey(name: string): string {
        return `attrs.${slugify(name, {lower: true})}.value`
    }

    assert({
               body: {
                   make,
                   year,
                   model,
                   generation,
                   trim,
                   diameters
               }
           }: Request<any, any, ReqBody, any>, res: Response, next: NextFunction) {
        if (!make || !year || !model || !generation || !trim || !diameters) {
            res.status(500).send({error: "make, year, model, generation, trim and diameters are required"});
        }
        next();
    }

    async handle(
        {
            body: {
                make,
                year,
                model,
                generation,
                trim,
                diameters
            }
        }: Request<any, any, ReqBody, any>, res: Response<SearchRespBodyItem[]>
    ) {
        const apiResp = await WheelSizeApi.searchByModel(make, year, model);

        const data: SearchRespBodyItem[] = [];
        const filtersDataSet = new Set();
        apiResp
            .filter((item) => item.trim === trim && item.generation.name === generation)
            .forEach((item) => {

                const variants: SearchRespBodyItem[] = item.wheels
                    .filter(x => diameters.includes(x.front.rim_diameter))
                    .reduce<SearchRespBodyItem[]>((acc, {front, rear}) => {
                        if (!front.rim_diameter || !front.rim_offset || !front.rim_width) {
                            return acc;
                        }

                        const dataString =
                            '' +
                            front.rim_diameter +
                            front.rim_offset +
                            front.rim_width +
                            rear.rim_diameter +
                            rear.rim_offset +
                            rear.rim_width +
                            item.stud_holes +
                            item.pcd;

                        if (filtersDataSet.has(dataString)) {
                            return acc;
                        }

                        filtersDataSet.add(dataString);

                        acc.push({
                            general: {
                                boltsCount: item.stud_holes,
                                boltsSpacing: item.pcd,
                                filters: [
                                    {
                                        key: WheelsSearchAction.generateAttrKey(RIM_PCD),
                                        value: `${item.stud_holes}x${item.pcd}`,
                                    }
                                ]
                            },
                            front: {
                                et: front.rim_offset,
                                width: front.rim_width,
                                diameter: front.rim_diameter,
                                filters: [
                                    {
                                        key: WheelsSearchAction.generateAttrKey(RIM_DIAMETER),
                                        value: front.rim_diameter,
                                    },
                                    {
                                        key: WheelsSearchAction.generateAttrKey(RIM_WIDTH),
                                        value: front.rim_width,
                                    },
                                    {
                                        key: WheelsSearchAction.generateAttrKey(RIM_ET),
                                        value: front.rim_offset,
                                    }
                                ]
                            },
                            rear: {
                                et: rear.rim_offset,
                                width: rear.rim_width,
                                diameter: rear.rim_diameter,
                                filters: [
                                    {
                                        key: WheelsSearchAction.generateAttrKey(RIM_DIAMETER),
                                        value: rear.rim_diameter,
                                    },
                                    {
                                        key: WheelsSearchAction.generateAttrKey(RIM_WIDTH),
                                        value: rear.rim_width,
                                    },
                                    {
                                        key: WheelsSearchAction.generateAttrKey(RIM_ET),
                                        value: rear.rim_offset,
                                    }
                                ]
                            }
                        });

                        return acc;
                    }, []);
                data.push(...variants);
            });

        res.send(data);
    }
}


