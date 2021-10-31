import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import Attribute from "@models/Attribute.model";
import {EsProduct} from "@server/elastic/EsProducts";
import {EsProductVariant, EsReqFilter, EsRespProduct, EsSearchReqBody, RespData} from "@actions/front/types";
import {EsQueryBuilder} from "../../../helpers/EsQueryBuilder";
import {setUser} from "../../../middlewares/auth";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import {JWTPayload} from "@core/services/AuthService";
import {IUserJWTPayload} from "@models/User.model";

const MAX_INT = 2147483647;

export class ProductElasticSearchAction implements Action {
    get action() {
        return [setUser, this.assert.bind(this), this.handle.bind(this)];
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
            },
            user
        }: Request<any, any, EsSearchReqBody, any>, res: Response) {
        try {

            const aggAttrs = await Attribute.findAggregatable();

            const availableFilter: EsReqFilter = {key: 'is_available', value: true};

            filters = filters?.length ? [...filters, availableFilter] : [availableFilter];

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
                sort: 'id:desc'
            });


            const body: EsRespProduct = resp.body as EsRespProduct;

            const total = body.hits.total.value;

            let products: EsProductVariant[] = body.hits.hits
                .map<EsProductVariant>((item) => item._source);

            const JWTPayload = user as JWTPayload<IUserJWTPayload>;
            if (JWTPayload?.user?.b2b_discount_group_id) {
                products = await B2BDiscountService.enrichESProductByB2BUserDiscount(JWTPayload.user, products) as EsProductVariant[];
            }

            const respData: RespData = {
                // @ts-ignore
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
