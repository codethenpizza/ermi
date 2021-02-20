export interface EsRespProduct {
    hits: {
        total: {
            value: number;
            relation: string;
        },
        max_score: number;
        hits: {
            _source: EsProductVariant,
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
    name: string;
    desc?: string;
    cats_ids: number[];
    attr_set_id: number;
    variants: EsProductVariant[]
}

export interface EsProductVariant {
    id?: number;
    product_id: number;
    vendor_code: string;
    desc?: string;
    price: number;
    price_discount?: number;
    weight?: number;
    in_stock_qty: number;
    is_available: boolean;
    is_discount: boolean;
    attrs: EsAttrValue;
    images: Image[];
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
        data: EsReqFilter[][];
        filters: any
    }
    size?: number;
    from?: number;
    searchString?: string;
}

export interface EsReqFilter {
    name: string;
    type: EsReqFilterType;
    value: EsReqFilterValue;
}

export type EsReqFilterType = 'attr' | 'prop';

export type EsReqFilterValue = string | string[] | number | number[] | RangeFilter;

export interface RangeFilter {
    gt?: number;
    gte?: number;
    lt?: number;
    lte?: number;
}

export interface RespData {
    total: number;
    products: EsProductVariant[];
    aggregations: {
        attrs: {
            doc_count: number;
            [x: string]: EsProdAggAttr | number;
        }
    }
}
