import {EsProductVariant, EsReqFilter, EsReqFilterValue, EsRespProduct, RangeFilter} from "@actions/front/types";
import bodybuilder, {Bodybuilder} from "bodybuilder";
import Attribute from "@models/Attribute.model";
import {groupBy} from "lodash";

export interface QueryParams {
    filters?: EsReqFilter[];
    groupedFilters?: EsReqFilter[][];
    searchString?: string;
}

export const JAVA_MAX_INT = 2147483647;

export class EsQueryBuilder {

    static makeQuery(params: QueryParams, aggAttrs?: Attribute[]): Bodybuilder {
        const query = bodybuilder();
        const filtersArr = EsQueryBuilder.makeAllFilters(params);
        query.query('bool', 'filter', filtersArr);
        if(aggAttrs) {
            EsQueryBuilder.addAggs(query, aggAttrs);
        }
        return query;
    }

    static makeAllFilters({filters, groupedFilters, searchString}: QueryParams): Object[] {
        const boolArr: Object[] = [
            {
                bool: EsQueryBuilder.makeAndFilters(filters)
            },
            {
                bool: EsQueryBuilder.makeOrFilters(groupedFilters)
            }
        ];

        if (searchString) {
            boolArr.push(EsQueryBuilder.makeSearchQuery(searchString));
        }

        return boolArr;
    }

    static makeAndFilters(filters: EsReqFilter[]): Object {
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
                    return EsQueryBuilder.makeFilter(items[0]);
                }

                return {
                    bool: {
                        should: items.map((item) => EsQueryBuilder.makeFilter(item))
                    }
                };
            })
        };
    }

    static makeOrFilters(filters: EsReqFilter[][]): Object {
        if (!filters?.length) {
            return {};
        }

        return {
            should: filters.filter(x => x?.length).map(f => ({
                bool: EsQueryBuilder.makeAndFilters(f)
            }))
        };
    }

    static makeFilter({value, key, nested}: EsReqFilter): Object {
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

    static makeSearchQuery(searchString: string): Object {
        return {
            // @ts-ignore
            query_string: {
                query: `*${searchString}*`
            }
        }
    }

    static getOperatorByValue(value: EsReqFilterValue): string {
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

    static addAggs(query: bodybuilder.Bodybuilder, attrs: Attribute[]): void {
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
                        return agg.agg('terms', pathWithAgg, {size: JAVA_MAX_INT});
                    });
                    break;

                default:
                    query.agg('terms', pathWithAgg, {size: JAVA_MAX_INT});
            }
        });
    }

    static mapBody({body}: any): EsProductVariant[] {
        return (body as EsRespProduct).hits.hits
            .map<EsProductVariant>((item) => item._source);
    }
}
