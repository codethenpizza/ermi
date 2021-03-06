import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {SearchByAxlesReqBody, SearchByAxlesProducts, SearchByAxlesParams, SearchByAxlesRespData} from "../types";
import Attribute from "@models/Attribute.model";
import {EsQueryBuilder, JAVA_MAX_INT} from "../../../helpers/EsQueryBuilder"
import bodybuilder from "bodybuilder";
import {EsProduct} from "@server/elastic/EsProducts";
import AttrType from "@models/AttrType.model";
import {groupBy} from "lodash";
import {AttrsAggregations} from "@actions/front/types";

export class SearchByAxlesAction implements Action {

    private esProduct = new EsProduct();

    get action() {
        return [this.assert.bind(this), this.handle.bind(this)];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({body}: Request<any, any, SearchByAxlesReqBody, any>, res: Response) {

        const availableModels = await this.getAvailableModels(body);

        // console.log('availableModels', availableModels);

        const from = body.from || 0;
        const products = await this.getGroupedProducts(
            body,
            availableModels.slice(from, from + body.size)
        );

        const aggregations = await this.getAggregations(body, availableModels);

        const respData: SearchByAxlesRespData = {
            products,
            total: availableModels.length,
            aggregations
        }

        res.send(respData);
    }

    private async getAvailableModels(
        {filters, extFilters, searchString, from = 0}: SearchByAxlesReqBody
    ): Promise<string[]> {
        const queryObj = EsQueryBuilder.makeQuery({
            filters,
            searchString,
        });

        await this.setAggs(queryObj, extFilters.axles);

        const query = queryObj.build();

        const resp = await this.esProduct.es.search({
            body: query,
            size: 0,
            from,
        });

        // console.log('aggregations', JSON.stringify(
        //     resp.body.aggregations['agg_terms_attrs.model.value'].buckets.filter(x => {
        //         const {front, rear} = x.agg_filters_wide_disk.buckets;
        //
        //         return front.doc_count && rear.doc_count;
        //     })
        // ));

        return resp.body.aggregations['agg_terms_attrs.model.value'].buckets
            .reduce((arr, item) => {
                const frontDocCount = item.agg_filters_wide_disk.buckets.front.doc_count;
                const rearDocCount = item.agg_filters_wide_disk.buckets.rear.doc_count;
                if (frontDocCount > 0 && rearDocCount > 0) {
                    arr.push(item.key);
                }
                return arr;
            }, [])
    }

    private async setAggs(query: bodybuilder.Bodybuilder, {front, rear}: SearchByAxlesParams): Promise<void> {
        const modelAttr = await Attribute.findOne({where: {slug: 'model'}, include: [AttrType]});
        const modelAttrPath = `attrs.${modelAttr.slug}.value`;

        query.agg('terms', modelAttrPath, {size: JAVA_MAX_INT}, (agg) => {
            return agg.agg('filters', 'wide_disk', {
                    field: undefined,
                    filters: {
                        front: {
                            bool: EsQueryBuilder.makeAndFilters(front)
                        },
                        rear: {
                            bool: EsQueryBuilder.makeAndFilters(rear)
                        }
                    }
                }
            )
        })
    }

    private async getGroupedProducts(body: SearchByAxlesReqBody, availableModels: string[]) {

        const modelAttrPath = 'attrs.model.value';

        const filtersWithModels = [
            ...body.filters,
            {key: modelAttrPath, value: availableModels}
        ];

        const frontFilters = body.extFilters.axles.front || [];
        const frontQuery = EsQueryBuilder.makeQuery({
            filters: [...filtersWithModels, ...frontFilters],
            searchString: body.searchString,
        }).build();
        const frontResp = await this.esProduct.es.search({body: frontQuery, size: 10000});
        const frontProducts = EsQueryBuilder.mapBody(frontResp);
        const groupedFrontProducts = groupBy(frontProducts, modelAttrPath);


        const rearFilters = body.extFilters.axles.rear || [];
        const rearQuery = EsQueryBuilder.makeQuery({
            filters: [...filtersWithModels, ...rearFilters],
            searchString: body.searchString,
        }).build();
        const rearResp = await this.esProduct.es.search({body: rearQuery, size: 10000});
        const rearProducts = EsQueryBuilder.mapBody(rearResp);
        const groupedRearProducts = groupBy(rearProducts, modelAttrPath);


        const modelsMap: SearchByAxlesProducts = availableModels.reduce((map, modelName) => {
            map[modelName] = {
                front: groupedFrontProducts[modelName],
                rear: groupedRearProducts[modelName]
            };
            return map;
        }, {});

        return modelsMap;
    }

    private async getAggregations(body: SearchByAxlesReqBody, availableModels: string[]): Promise<AttrsAggregations> {

        const modelAttrPath = 'attrs.model.value';

        const filtersWithModels = [
            ...body.filters,
            {key: modelAttrPath, value: availableModels}
        ];

        const aggsQuery = EsQueryBuilder.makeQuery({
            filters: filtersWithModels,
            groupedFilters: [
                body.extFilters.axles.rear,
                body.extFilters.axles.front,
            ],
            searchString: body.searchString,
        });

        const aggAttrs = await Attribute.findAggregatable();
        EsQueryBuilder.addAggs(aggsQuery, aggAttrs);

        const query = aggsQuery.build();

        const resp = await this.esProduct.es.search({
            body: query,
            size: 0
        });


        return resp.body.aggregations;
    }
}
