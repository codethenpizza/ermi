export interface IEsProduct {
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
    attrs: EsAttrValue[];
}

export interface EsAttrValue {
    name: string;
    value: string | boolean | number;
    type: string;
}
