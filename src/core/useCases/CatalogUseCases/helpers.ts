import {Elastic} from "@core/services/elastic/types";
import {IAttribute} from "@core/models/Attribute.model";
import {CatalogAttrFilterOptionsMap} from "@core/useCases/CatalogUseCases/types";

export const getAttrFilterOptionsMap = (aggs: Elastic.SearchResponse<any>['aggregations'], aggAttrs: IAttribute[]): CatalogAttrFilterOptionsMap => {
    const getKey = (str: string) => str.split('agg_terms_')[1];
    const getName = (key: string) => {
        const slug = key.split('.')[1];

        const attr = aggAttrs.find(x => x.slug === slug);
        if (attr) {
            return attr.name;
        }

        return slug;
    }

    return Object.entries(aggs).reduce<CatalogAttrFilterOptionsMap>((map, [key, value]) => {

        const attrSchemeKey = getKey(key);

        map[attrSchemeKey] = {
            name: getName(attrSchemeKey),
            options: value.buckets.map(x => ({value: x.key, count: x.doc_count}))
        };

        return map;
    }, {});
}
