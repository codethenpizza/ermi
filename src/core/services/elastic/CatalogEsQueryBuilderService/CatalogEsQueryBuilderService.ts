import {IAttribute} from "@core/models/Attribute.model";
import bodybuilder, {Bodybuilder} from "bodybuilder";
import {QueryBuilderParams} from "@core/services/elastic/CatalogEsQueryBuilderService/types";
import {Elastic} from "@core/services/elastic/types";
import {JAVA_MAX_INT} from "@core/services/elastic/CatalogEsQueryBuilderService/constants";
import {ElasticProductService} from "@core/services/elastic/ElasticProductService/ElasticProductService";
import {EsScheme} from "@core/services/elastic/schemas/types";

export class CatalogEsQueryBuilderService {

    constructor(
        private esProductService: ElasticProductService
    ) {
    }

    makeQuery(params: QueryBuilderParams, aggAttrs?: IAttribute[]): Bodybuilder {
        const query = bodybuilder();

        const filtersArr = this.makeAllFilters(params);
        query.query('bool', 'filter', filtersArr);

        if (aggAttrs) {
            this.addAggs(query, aggAttrs);
        }

        return query;
    }

    makeAllFilters({filters, groupedFilters, searchString}: QueryBuilderParams): Object[] {
        const boolArr: Object[] = [
            {
                bool: this.makeAndFilters(filters)
            },
            {
                bool: this.makeOrFilters(groupedFilters)
            }
        ];

        if (searchString) {
            boolArr.push(this.makeSearchQuery(searchString));
        }

        return boolArr;
    }

    makeAndFilters(filters: Elastic.SearchFilter[]): Object {
        if (!filters?.length) {
            return {};
        }

        const groupedFilters = filters.reduce<Record<string, Elastic.SearchFilter[]>>((group, item) => {
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

    makeOrFilters(filters: Elastic.SearchFilter[][]): Object {
        if (!filters?.length) {
            return {};
        }

        return {
            should: filters.filter(x => x?.length).map(f => ({
                bool: this.makeAndFilters(f)
            }))
        };
    }

    makeFilter({key, value}: Elastic.SearchFilter): Object {

        const scheme = this.esProductService.getProductMapping();

        const SEPARATOR = '.';

        const path = key.split(SEPARATOR);

        const makeQueryByScheme = (pathIndex: number, scheme: EsScheme.Scheme) => {
            const pathPart = path[pathIndex];

            const schemeProp: EsScheme.Prop = scheme[pathPart];

            const isLastPath = pathIndex === path.length - 1;

            if (isLastPath) {
                if (!schemeProp.type || schemeProp.type === 'nested') {
                    throw new Error(`Wrong key - ${key}`);
                }

                const patches = this.getFilterPatches({key, value});

                if (patches.length) {
                    return {
                        bool: {
                            must: [
                                ...patches,
                                {
                                    [this.getOperatorByValue(value)]: {
                                        [key]: value
                                    }
                                }
                            ]
                        }
                    };
                }

                return {
                    [this.getOperatorByValue(value)]: {
                        [key]: value
                    }
                };
            }

            if (schemeProp.type === 'nested') {
                return {
                    nested: {
                        path: path.slice(0, pathIndex + 1).join(SEPARATOR),
                        query: makeQueryByScheme(pathIndex + 1, schemeProp.properties)
                    }
                }
            }

            if (!schemeProp.properties) {
                throw new Error(`Wrong key - ${key}`);
            }

            return makeQueryByScheme(pathIndex + 1, schemeProp.properties);
        }

        return makeQueryByScheme(0, scheme);
    }

    makeSearchQuery(searchString: string): Object {
        const article = parseInt(searchString);
        const searchByArticle = !isNaN(article);

        const should: any[] = [
            {
                // @ts-ignore
                query_string: {
                    query: searchString.split(' ').map(x => (`*${x}*`)).join(' AND ')
                }
            }
        ];

        if (searchByArticle) {
            should.push({
                term: {
                    id: article
                }
            });
        }

        return {
            bool: {
                should
            }
        }
    }

    getOperatorByValue(value: Elastic.SearchFilterValue): string {
        const isRange =
            (value as Elastic.RangeFilter)?.gt !== undefined ||
            (value as Elastic.RangeFilter)?.gte !== undefined ||
            (value as Elastic.RangeFilter)?.lt !== undefined ||
            (value as Elastic.RangeFilter)?.lte !== undefined
        if (isRange) {
            return 'range';
        }

        if (Array.isArray(value)) {
            return 'terms'
        }

        return 'term';
    }

    addAggs(query: bodybuilder.Bodybuilder, attrs: IAttribute[]): void {
        attrs.forEach(({slug, type, aggPath}) => {
            const path = `attrs.${slug}.value`;
            let pathWithAgg = path;
            if (aggPath) {
                pathWithAgg += `.${aggPath}`;
            }
            switch (type.name) {
                case 'json':
                case 'array':
                    query.agg('nested', path, {path, field: undefined}, agg => {
                        return agg.agg('terms', pathWithAgg, {size: JAVA_MAX_INT});
                    });
                    break;

                default:
                    query.agg('terms', pathWithAgg, {size: JAVA_MAX_INT});
            }
        });
    }

    private getFilterPatches({key}: Elastic.SearchFilter): Object[] {
        const patches = [];

        // const shouldUseOfferPriorityFlag = key.split('.')[0] === 'offers';
        // const offerPriorityFlag = {
        //     term: {
        //         ['offers.priority']: true
        //     }
        // };
        // if (shouldUseOfferPriorityFlag) {
        //     patches.push(offerPriorityFlag);
        // }

        if (key === 'offers.stock.shippingTime.to') {
            patches.push({
                "range": {
                    "offers.stock.count": {
                        "gt": 0
                    }
                }
            });
        }

        return patches;
    }
}
