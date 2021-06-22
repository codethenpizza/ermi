import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import bodybuilder from "bodybuilder";
import Attribute from "@models/Attribute.model";
import {EsProduct} from "@server/elastic/EsProducts";
import {
    EsProductVariant,
    EsReqFilter,
    EsReqFilterValue,
    EsRespProduct,
    EsSearchReqBody, RangeFilter,
    RespData
} from "@actions/front/types";
import {EsQueryBuilder} from "../../../helpers/EsQueryBuilder";

const MAX_INT = 2147483647;

export class ProductElasticSearchAction implements Action {
    get action() {
        return [this.assert.bind(this), this.handle.bind(this)];
    }

    assert(req: Request<any, any, EsSearchReqBody, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(
        {
            body: {
                filters,
                extFilters,
                size = 20,
                from = 0,
                searchString,
            }
        }: Request<any, any, EsSearchReqBody, any>, res: Response) {
        try {

            const aggAttrs = await Attribute.findAggregatable();

            const query = EsQueryBuilder.makeQuery({
                filters,
                groupedFilters: extFilters?.data,
                searchString,
            }, aggAttrs).build();

            console.log('query', JSON.stringify(query));

            const esProduct = new EsProduct();
            const resp = await esProduct.es.search({
                body: query,
                size,
                from,
            });


            const body: EsRespProduct = resp.body as EsRespProduct;

            const total = body.hits.total.value;

            const products: EsProductVariant[] = body.hits.hits
                .map<EsProductVariant>((item) => item._source);

            const respData: RespData = {
                products,
                total,
                aggregations: body.aggregations
            };

            res.send(respData);
        } catch (error) {
            res.status(500).send({error});
        }
    }
}
