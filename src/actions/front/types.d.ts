import {IOffer} from "@core/models/Offer.model";
import {IProductVariant} from "@core/models/ProductVariant.model";
import {Elastic} from "@core/services/elastic/types";

export interface EsRespProduct {
    hits: {
        total: {
            value: number;
            relation: string;
        },
        max_score: number;
        hits: {
            _source: Elastic.ProductVariant,
        }[]
    },
    aggregations: {
        attrs: {
            doc_count: number;
            [x: string]: EsProdAggAttr | number;
        }
    }
}

export interface EsProdAggAttr {
    doc_count_error_upper_bound: number;
    sum_other_doc_count: number;
    buckets: Bucket[];
}

export interface Bucket {
    key: number | string;
    doc_count: number;
}

export interface EsProductItem {
    id: number;
    desc?: string;
    cats_ids: number[];
    attr_set_id: number;
}

export interface EsProductVariant extends Omit<IProductVariant, 'productVariantImgs' | 'attrs' | 'offers' | 'product'> {
    attrs: EsAttrValue;
    offers: IOffer[];
    name: string;
    product: EsProductItem;
}

export interface EsProductVariantOffer extends Omit<EsProductVariant, 'offers'> {
    offer: IOffer;
}

export interface EsAttrValue {
    [k: string]: {
        name: string;
        value: string | boolean | number;
        slug: string;
        type: string;
    };
}

export interface Image {
    id: number;
    original_uri: string;
    large_uri: string;
    medium_uri: string;
    small_uri: string;
    thumbnail_uri: string;
    name: string;
    mimetype: string;
    size: number;
    ProductVariantImgModel: ProductVariantImgModel;
}

export interface ProductVariantImgModel {
    image_id: number;
    position: number;
    product_variant_id: number;
}

export interface EsSearchReqBody {
    filters?: EsReqFilter[];
    extFilters?: {
        data?: EsReqFilter[][];
        filters?: any;
        [x: string]: any;
    }
    size?: number;
    from?: number;
    searchString?: string;
}

export interface EsReqFilter {
    key: string;
    nested?: string;
    value: EsReqFilterValue;
}

export type EsReqFilterValue = string | string[] | number | number[] | boolean | RangeFilter;

export interface RangeFilter {
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
}

export interface RespData {
    total: number;
    products: EsProductVariant[];
    aggregations: AttrsAggregations;
}

export interface AttrsAggregations {
    attrs: {
        doc_count: number;
        [x: string]: EsProdAggAttr | number;
    }
}
