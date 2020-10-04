import {Action} from "@projTypes/action";
import {NextFunction, Response, Request} from "express";
import {WheelSizeApi} from "../index";
import {EsReqFilter} from "@actions/front/Product/ProductElasticSearchAction";

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

        const filters: EsReqFilter[][] = [];
        apiResp.forEach((item) => {
            const filter: EsReqFilter[] = [
                {
                    name: 'diameter',
                    value: Array.from(new Set(item.wheels.map(x => x.front.rim_diameter)))
                },
                {
                    name: 'width',
                    value: Array.from(new Set(item.wheels.map(x => x.front.rim_width)))
                },
                {
                    name: 'et',
                    value: Array.from(new Set(item.wheels.map(x => x.front.rim_offset)))
                },
            ];
            filters.push(filter);
        });

        res.send(apiResp.map(x => x.wheels));
    }
}
