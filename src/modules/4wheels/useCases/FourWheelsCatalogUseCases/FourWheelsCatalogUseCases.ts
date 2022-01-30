import {AxlesParams, CatalogSearchByAxlesResponse, SearchByAxlesParams, SearchByAxlesProducts} from "./types";
import {CatalogEsQueryBuilderService} from "@core/services/elastic/CatalogEsQueryBuilderService/CatalogEsQueryBuilderService";
import Attribute from "@core/models/Attribute.model";
import {JAVA_MAX_INT} from "@core/services/elastic/CatalogEsQueryBuilderService/constants";
import {ElasticProductService} from "@core/services/elastic/ElasticProductService/ElasticProductService";
import {get, groupBy} from "lodash";
import {CatalogAttrFilterOptionsMap} from "@core/useCases/CatalogUseCases/types";
import {getAttrFilterOptionsMap} from "@core/useCases/CatalogUseCases/helpers";
import {OfferPriorityService} from "@core/services/catalog/OfferPriorityService";

const AGG_TYPE = 'filters';
const AGG_FIELD = 'wide_disk'
const MODEL_ATTR_PATH = 'attrs.model.value';

export class FourWheelsCatalogUseCases {

    constructor(
        private queryBuilderService: CatalogEsQueryBuilderService,
        private elasticProductService: ElasticProductService,
        private offerPriorityService: OfferPriorityService,
    ) {
    }

    async searchByAxles(params: SearchByAxlesParams): Promise<CatalogSearchByAxlesResponse> {
        const availableModels = await this.getAvailableModels(params);

        const from = params.from || 0;
        const products = await this.getGroupedProducts(
            params,
            availableModels.slice(from, from + params.size)
        );

        const attrFilterOptionsMap = await this.getAttrFilterOptionsMap(params, availableModels);

        return {
            products,
            total: availableModels.length,
            attrFilterOptionsMap,
        };
    }

    private async getAvailableModels(
        {filters, extFilters, searchString, from = 0}: SearchByAxlesParams
    ): Promise<string[]> {
        const queryObj = this.queryBuilderService.makeQuery({filters, searchString});

        this.setAggs(queryObj, extFilters.axles);

        const query = queryObj.build();

        const resp = await this.elasticProductService.search({
            body: query,
            size: 0,
            from,
        });

        const modelAggKey = `agg_terms_${MODEL_ATTR_PATH}`;

        const bucketAggKey = `agg_${AGG_TYPE}_${AGG_FIELD}`

        return resp.aggregations[modelAggKey].buckets
            .reduce((arr, item) => {
                const frontDocCount = item[bucketAggKey].buckets.front.doc_count;
                const rearDocCount = item[bucketAggKey].buckets.rear.doc_count;
                if (frontDocCount > 0 && rearDocCount > 0) {
                    arr.push(item.key);
                }
                return arr;
            }, [])
    }

    private setAggs(query: bodybuilder.Bodybuilder, {front, rear}: AxlesParams): void {
        query.agg('terms', MODEL_ATTR_PATH, {size: JAVA_MAX_INT}, (agg) => {
            return agg.agg(AGG_TYPE, AGG_FIELD, {
                    field: undefined,
                    filters: {
                        front: {
                            bool: this.queryBuilderService.makeAndFilters(front)
                        },
                        rear: {
                            bool: this.queryBuilderService.makeAndFilters(rear)
                        }
                    }
                }
            )
        })
    }

    private async getGroupedProducts(body: SearchByAxlesParams, availableModels: string[]) {

        const filtersWithModels = [
            ...body.filters,
            {key: MODEL_ATTR_PATH, value: availableModels}
        ];

        const frontFilters = body.extFilters.axles.front || [];
        const frontQuery = this.queryBuilderService.makeQuery({
            filters: [...filtersWithModels, ...frontFilters],
            searchString: body.searchString,
        }).build();
        const frontResp = await this.elasticProductService.search({body: frontQuery, size: 10000});
        const frontProducts = await Promise.all(frontResp.products.map(x => this.offerPriorityService.chooseOffer(x)));
        const groupedFrontProducts = this.groupByLowercase(frontProducts, MODEL_ATTR_PATH);


        const rearFilters = body.extFilters.axles.rear || [];
        const rearQuery = this.queryBuilderService.makeQuery({
            filters: [...filtersWithModels, ...rearFilters],
            searchString: body.searchString,
        }).build();
        const rearResp = await this.elasticProductService.search({body: rearQuery, size: 10000});
        const rearProducts = await Promise.all(rearResp.products.map(x => this.offerPriorityService.chooseOffer(x)));
        const groupedRearProducts = this.groupByLowercase(rearProducts, MODEL_ATTR_PATH);

        // TODO add enrichESProductByB2BUserDiscount
        const modelsMap: SearchByAxlesProducts = availableModels.reduce((map, modelName) => {
            const modelItem = groupedFrontProducts[modelName];
            const originalModelName = modelItem ? get(modelItem[0], MODEL_ATTR_PATH) : modelName;
            map[originalModelName] = {
                front: groupedFrontProducts[modelName],
                rear: groupedRearProducts[modelName]
            };
            return map;
        }, {});

        return modelsMap;
    }

    private async getAttrFilterOptionsMap(body: SearchByAxlesParams, availableModels: string[]): Promise<CatalogAttrFilterOptionsMap> {

        const filtersWithModels = [
            ...body.filters,
            {key: MODEL_ATTR_PATH, value: availableModels}
        ];

        const aggsQuery = this.queryBuilderService.makeQuery({
            filters: filtersWithModels,
            groupedFilters: [
                body.extFilters.axles.rear,
                body.extFilters.axles.front,
            ],
            searchString: body.searchString,
        });

        const aggAttrs = await Attribute.findAggregatable();
        this.queryBuilderService.addAggs(aggsQuery, aggAttrs);

        const query = aggsQuery.build();

        const resp = await this.elasticProductService.search({
            body: query,
            size: 0
        });

        return getAttrFilterOptionsMap(resp.aggregations, aggAttrs);

    }

    private groupByLowercase(arr: any[], path: string): Object {
        const data = groupBy(arr, path);
        if (!Object.keys(data).length) {
            return data;
        }

        return Object.entries(data).reduce((acc, [key, data]) => {

            acc[key.toLowerCase()] = data;

            return acc;
        }, {});
    }

}
