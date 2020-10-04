import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import bodybuilder from "bodybuilder";
import Attribute from "@models/Attribute.model";
import {EsProduct} from "../../../server/elastic/EsProducts";

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

    async handle({body}: Request<any, any, EsSearchReqBody, any>, res: Response) {
        try {
            const query = await this.makeQuery(body.filters);
            console.log('query', JSON.stringify(query));

            const esProduct = new EsProduct();
            const resp = await esProduct.es.search({
                body: query,
                size: body.size || 20,
                from: body.from || 0
            });
            res.send(resp.body);
        } catch (error) {
            res.status(500).send({error});
        }
    }

    private async makeQuery(filters: EsReqFilter[]) {
        const query = bodybuilder();
        this.addFilters(query, filters);
        await this.addAggs(query);
        return query.build();
    }

    private addFilters(query: bodybuilder.Bodybuilder, filters: EsReqFilter[]) {
        if (filters) {
            query.query('nested', 'path', 'variants', (q) => {
                q.query('bool', 'filter', filters.map(({name, value}) =>
                        ({
                            terms: {
                                [`variants.attrs.${name}.value`]: value
                            }
                        })
                    )
                );
                return q;
            });
        }
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
