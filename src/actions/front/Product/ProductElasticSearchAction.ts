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

            const query = await this.makeQuery(filters, searchString, extFilters?.data);

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

    private async makeQuery(filters: EsReqFilter[], searchString: string, extFilters: EsReqFilter[][]) {
        const query = bodybuilder();
        this.addFilters(query, filters, searchString, extFilters);
        await this.addAggs(query);
        return query.build();
    }

    private addFilters(query: bodybuilder.Bodybuilder, filters: EsReqFilter[], searchString: string, extFilters: EsReqFilter[][]) {
        const boolArr = [
            {
                bool: this.setFilters(filters)
            },
            {
                bool: this.setExtFilters(extFilters)
            }
        ];

        if (searchString) {
            boolArr.push({
                // @ts-ignore
                query_string: {
                    query: `*${searchString}*`
                }
            });
        }
        query.query('bool', 'filter', boolArr);
    }

    private setExtFilters(extFilters: EsReqFilter[][]) {
        return extFilters?.length ? {
            should: extFilters.filter(x => x?.length).map(f => ({
                bool: {
                    filter: f.map(({key, value}) => ({
                        [this.getOperatorByValue(value)]: {
                            [key]: value
                        }
                    }))
                }
            }))
        } : {};
    }

    private setFilters(filters: EsReqFilter[]) {
        if (!filters?.length) {
            return {};
        }

        const groupedFilters = filters.reduce<{ [x: string]: EsReqFilter[] }>((group, item) => {
            if (!group[item.key]) {
                group[item.key] = [];
            }
            group[item.key].push(item);

            return group;
        }, {});

        return {
            filter: Object.values(groupedFilters).map((items) => {

                if (items.length === 1) {
                    return this.makeFilter(items[0]);
                }

                return {
                    bool: {
                        should: items.map((item) => this.makeFilter(item))
                    }
                };
            })
        };
    }

    private makeFilter({value, key, nested}: EsReqFilter) {
        if (nested) {
            return {
                nested: {
                    path: nested,
                    query: {
                        [this.getOperatorByValue(value)]: {
                            [key]: value
                        }
                    }
                }
            }
        }

        return {
            [this.getOperatorByValue(value)]: {
                [key]: value
            }
        }
    }

    private getOperatorByValue(value: EsReqFilterValue): string {
        const isRange =
            (value as RangeFilter)?.gt !== undefined ||
            (value as RangeFilter)?.gte !== undefined ||
            (value as RangeFilter)?.lt !== undefined ||
            (value as RangeFilter)?.lte !== undefined
        if (isRange) {
            return 'range';
        }

        if (Array.isArray(value)) {
            return 'terms'
        }

        return 'term';
    }

    private async addAggs(query: bodybuilder.Bodybuilder) {
        const attrs = await Attribute.findAggregatable();

        attrs.forEach(({slug, type, aggPath}) => {
            const path = `attrs.${slug}.value`;
            let pathWithAgg = path;
            if (aggPath) {
                pathWithAgg += `.${aggPath}`;
            }
            switch (type.type) {
                case 'json':
                case 'array':
                    query.agg('nested', path, {path, field: undefined}, agg => {
                        return agg.agg('terms', pathWithAgg);
                    });
                    break;

                default:
                    query.agg('terms', pathWithAgg, {size: MAX_INT});
            }
        });
    }
}
