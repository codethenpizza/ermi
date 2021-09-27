export interface EsProductVariant {
    id?: number;
    name: string;
    product_id: number;
    vendor_code: string;
    desc?: string;
    price: number;
    price_discount?: number;
    weight?: number;
    in_stock_qty: number;
    is_available: boolean;
    is_discount: boolean;
    cat: number[];
    attrs: EsProductVariantAttrs;
}

export interface EsProductVariantAttrs {
    [x: string]: EsAttrValue
}

export interface EsAttrValue {
    name: string;
    value: string | boolean | number;
    type: string;
}
