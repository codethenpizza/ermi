import {Stock} from "../../../modules/suppliers/productTypes/rim/rimTypes";

export namespace Elastic {

    interface SearchResponse<T> {
        products: T[],
        total: number,
        aggregations?: {
            attrs: {
                doc_count: number;
                [x: string]: EsProdAggAttr | number;
            }
        }
    }

    interface EsProdAggAttr {
        doc_count_error_upper_bound: number;
        sum_other_doc_count: number;
        buckets: Bucket[];
    }

    interface Bucket {
        key: number | string;
        doc_count: number;
    }

    export interface SearchParams {
        filters?: SearchFilter[];
        extFilters?: {
            data?: SearchFilter[][];
            filters?: any;
            [x: string]: any;
        }
        size?: number;
        from?: number;
        searchString?: string;
        sort?: string;
    }

    export interface SearchFilter {
        key: string;
        value: SearchFilterValue;
    }

    export type SearchFilterValue = string | string[] | number | number[] | boolean | RangeFilter;

    export interface RangeFilter {
        gt?: number;
        gte?: number;
        lt?: number;
        lte?: number;
    }


    // Entities

    interface Product {
        id: number;
        name: string;
        desc?: string;
        attr_set_id: number;
    }

    interface ProductVariant {
        id: number;
        product_id: number;
        variant_code: string;
        cat_ids: number[];
        name: string;
        desc?: string;
        is_available: boolean;
        attrs: Attributes;
        images: Image[];
        offers: Offer[];
        product: Product;
    }

    interface ProductVariantFormatted extends Omit<ProductVariant, 'offers'> {
        offer: Offer;
    }

    interface Offer {
        id: number;
        product_variant_id: number;
        vendor_id: number;
        vendor_code: string;
        price: number;
        discount_price?: number;
        in_stock_qty: number;
        is_available: boolean;
        images: Image[];
        stock: Stock[];
        priority: boolean;
    }

    interface Attributes {
        [k: string]: Attribute;
    }

    interface Attribute {
        name: string;
        value: string | boolean | number;
        slug: string;
        type: string;
    }

    interface Image {
        id: number;
        original_uri: string;
        large_uri: string;
        medium_uri: string;
        small_uri: string;
        thumbnail_uri: string;
        name: string;
        mimetype: string;
        size: number;
        position: number;
    }

}
