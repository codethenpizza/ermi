import {AttrsAggregations, EsProductVariant, EsReqFilter, EsSearchReqBody} from "@actions/front/types";

export interface SearchByAxlesReqBody extends EsSearchReqBody {
    extFilters: {
        axles: SearchByAxlesParams;
    }
}

export interface SearchByAxlesParams {
    front: EsReqFilter[];
    rear: EsReqFilter[];
}

export interface SearchByAxlesRespData {
    total: number;
    products: SearchByAxlesProducts;
    aggregations: AttrsAggregations;
}

export interface SearchByAxlesProducts {
    [modelsName: string]: {
        front: EsProductVariant[],
        rear: EsProductVariant[]
    }
}
