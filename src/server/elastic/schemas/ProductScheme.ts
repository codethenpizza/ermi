import {LOWERCASE_NORMALIZER} from "@server/elastic/schemas/Analysis";



export const ProductScheme = (attrSchemes?: Object[]): Object => {
    const scheme = {...DefaultScheme};
    if(attrSchemes.length) {
        scheme['attrs'] = {
            "properties": attrSchemes.reduce((acc, s) => {
                acc = {...acc, ...s};
                return acc;
            }, {})
        }
    }

    return scheme;
};

const DefaultScheme = {
    "id": {
        "type": "long"
    },
    "name": {
        "type": "keyword",
        "normalizer": LOWERCASE_NORMALIZER
    },
    "created_at": {
        "type": "date"
    },
    "in_stock_qty": {
        "type": "integer"
    },
    "is_available": {
        "type": "boolean"
    },
    "is_discount": {
        "type": "boolean"
    },
    "price": {
        "type": "scaled_float",
        "scaling_factor": 100
    },
    "product_id": {
        "type": "integer"
    },
    "updated_at": {
        "type": "date"
    },
    "vendor_code": {
        "type": "keyword",
        "normalizer": "lowercase_normalizer"
    },
    "cat": {
        "type": "integer"
    },
    "images": {
        "type": "nested",
        "properties": {
            "ProductVariantImgModel" : {
                "properties" : {
                    "image_id" : {
                        "type" : "long",
                        "index": false
                    },
                    "position" : {
                        "type" : "long",
                        "index": false
                    },
                    "product_variant_id" : {
                        "type" : "long",
                        "index": false
                    }
                }
            },
            "id" : {
                "type" : "long",
                "index": false
            },
            "original_uri" : {
                "type" : "text",
                "index": false
            },
            "large_uri" : {
                "type" : "text",
                "index": false
            },
            "medium_uri" : {
                "type" : "text",
                "index": false
            },
            "small_uri" : {
                "type" : "text",
                "index": false
            },
            "thumbnail_uri" : {
                "type" : "text",
                "index": false
            },
            "name" : {
                "type" : "text",
                "index": false
            },
            "mimetype" : {
                "type" : "text",
                "index": false
            },
            "size" : {
                "type" : "long",
                "index": false
            },
            "updated_at" : {
                "type" : "date",
                "index": false
            },
            "created_at" : {
                "type" : "date",
                "index": false
            },
        }
    }
};
