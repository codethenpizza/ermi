import {IOfferCreateProductData, IOfferUpdateData} from "@core/useCases/OfferUseCases/types";

export interface ParsedData<T extends Record<string, any> = {}> {
    offerData: IOfferUpdateData;
    productData: IOfferCreateProductData;
    attrValuesMap: T;
}

export interface SupplierDataParserConfig {
    dataParserLimit: string;
}

export interface CountParams {
    total: number;
    offset: number;
}

export interface OptionsIDMapping {
    attr_set_id: number;
    cat: number;

    [x: string]: number;
}
