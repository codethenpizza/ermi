import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import bodybuilder from "bodybuilder";
import Attribute from "@models/Attribute.model";
import {EsProduct} from "@server/elastic/EsProducts";

export interface EsSearchReqBody {
    filters?: EsReqFilter[];
    size?: number;
    from?: number;
}

export interface EsReqFilter {
    name: string;
    type?: any; // TODO add filter type
    value: string | number | string[] | number[];
}

export class ProductElasticSearchAction implements Action {
    get action() {
        return [this.assert.bind(this), this.handle.bind(this)];
    }

    assert(req: Request<any, any, EsSearchReqBody, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body: {filters, size = 20, from = 0}, cookies}: Request<any, any, EsSearchReqBody, any>, res: Response) {
        try {
            let cookieFilters: EsReqFilter[][] = [];
            if (cookies['wheel-size-filter']) {
                cookieFilters = JSON.parse(cookies['wheel-size-filter'])?.data || [];
            }

            const query = await this.makeQuery(filters, cookieFilters);

            const esProduct = new EsProduct();
            const resp = await esProduct.es.search({
                body: query,
                size,
                from
            });
            res.send(resp.body);
        } catch (error) {
            res.status(500).send({error});
        }
    }

    private async makeQuery(filters: EsReqFilter[], cookieFilters: EsReqFilter[][]) {
        const query = bodybuilder();
        this.addFilters(query, filters, cookieFilters);
        await this.addAggs(query);
        return query.build();
    }

    private addFilters(query: bodybuilder.Bodybuilder, filters: EsReqFilter[], cookieFilters: EsReqFilter[][]) {
        query.query('nested', 'path', 'variants', (q) => {
            q.query('bool', 'filter', [
                {
                    bool: this.setFilters(filters)
                },
                {
                    bool: this.setCookieFilters(cookieFilters)
                }
            ]);
            return q;
        });
    }

    private setCookieFilters(cookieFilters: EsReqFilter[][]) {
        return cookieFilters?.length ? {
            should: cookieFilters.filter(x => x?.length).map(f => ({
                bool: {
                    filter: f.map(({name, value}) => ({
                        [Array.isArray(value) ? 'terms' : 'term']: {
                            [`variants.attrs.${name}.value`]: value
                        }
                    }))
                }
            }))
        } : {};
    }

    private setFilters(filters: EsReqFilter[]) {
        return filters?.length ? {
            filter: filters.map(({name, value}) => {
                    return {
                        terms: {
                            [`variants.attrs.${name}.value`]: value
                        }
                    };
                }
            )
        } : {};
    }

    private async addAggs(query: bodybuilder.Bodybuilder) {
        const attrs = await Attribute.findAll();

        query.aggregation('nested', null, {path: 'variants'}, 'attrs', (q) => {
            attrs.forEach(({slug}) => {
                const field = `variants.attrs.${slug}.value`;
                q.agg('terms', field);
            });
            return q;
        });
    }
}
