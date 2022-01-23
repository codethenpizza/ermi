import {Elastic} from "@core/services/elastic/types";

export interface QueryBuilderParams {
    filters?: Elastic.SearchFilter[];
    groupedFilters?: Elastic.SearchFilter[][];
    searchString?: string;
}
