import {EsReqFilter} from "@actions/front/types";
import {Elastic} from "@core/services/elastic/types";
import {CatalogSearchResponse} from "@core/useCases/CatalogUseCases/types";

export interface SearchByAxlesParams extends Elastic.SearchParams {
    extFilters: {
        axles: AxlesParams;
    }
}

export interface AxlesParams {
    front: EsReqFilter[];
    rear: EsReqFilter[];
}


export interface CatalogSearchByAxlesResponse extends Omit<CatalogSearchResponse, 'products'> {
    products: SearchByAxlesProducts;
}

export interface SearchByAxlesProducts {
    [modelsName: string]: {
        front: Elastic.ProductVariantFormatted[],
        rear: Elastic.ProductVariantFormatted[],
    }
}
