import {Elastic} from "@core/services/elastic/types";

export interface CatalogSearchResponse {
    products: Elastic.ProductVariantFormatted[];
    total: number;
    attrFilterOptionsMap: CatalogAttrFilterOptionsMap;
}

export interface CatalogAttrFilterOptionsMap {
    [x: string]: CatalogAttrFilter;
}

export interface CatalogAttrFilter {
    name: string;
    options: CatalogAttrFilterOption[];
}

export interface CatalogAttrFilterOption {
    value: string | number;
    count: number;
}
