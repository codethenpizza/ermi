import {LOWERCASE_NORMALIZER} from "@core/services/elastic/schemas/normalizers/LowerCase";
import {Elastic} from "@core/services/elastic/types";
import {EsScheme} from "@core/services/elastic/schemas/types";

const imagesType: EsScheme.Prop<Elastic.Image> = {
    "type": "nested",
    "properties": {
        "id": {
            "type": "long",
            "index": false
        },
        "original_uri": {
            "type": "text",
            "index": false
        },
        "large_uri": {
            "type": "text",
            "index": false
        },
        "medium_uri": {
            "type": "text",
            "index": false
        },
        "small_uri": {
            "type": "text",
            "index": false
        },
        "thumbnail_uri": {
            "type": "text",
            "index": false
        },
        "name": {
            "type": "text",
            "index": false
        },
        "mimetype": {
            "type": "text",
            "index": false
        },
        "size": {
            "type": "long",
            "index": false
        },
        "position": {
            "type": "integer",
            "index": false
        }
    }
};

const productType: EsScheme.Prop<Elastic.Product> = {
    "properties": {
        "id": {
            "type": "long"
        },
        "desc": {
            "type": "text",
        },
        "attr_set_id": {
            "type": "integer"
        },
        "name": {
            "type": "text",
        },
    }
};

export const ProductScheme: EsScheme.Scheme<Omit<Elastic.ProductVariant, 'attrs'>> = {
    "id": {
        "type": "long"
    },
    "name": {
        "type": "keyword",
        "normalizer": LOWERCASE_NORMALIZER
    },
    "is_available": {
        "type": "boolean"
    },
    "product_id": {
        "type": "integer"
    },
    "variant_code": {
        "type": "text",
    },
    "images": imagesType,
    "offers": {
        "type": "nested",
        "properties": {
            "id": {
                "type": "long"
            },
            "discount_price": {
                "type": "scaled_float",
                "scaling_factor": 100
            },
            "images": imagesType,
            "in_stock_qty": {
                "type": "integer"
            },
            "is_available": {
                "type": "boolean"
            },
            "price": {
                "type": "scaled_float",
                "scaling_factor": 100
            },
            "product_variant_id": {
                "type": "integer"
            },
            "vendor_code": {
                "type": "text"
            },
            "vendor_id": {
                "type": "integer"
            },
            "stock": {
                "type": "nested",
                "properties": {
                    "name": {
                        "type": "text"
                    },
                    "shippingTime": {
                        "properties": {
                            "from": {
                                "type": "integer"
                            },
                            "to": {
                                "type": "integer"
                            }
                        }
                    },
                    "count": {
                        "type": "integer"
                    }
                }
            },
            "priority": {
                "type": "boolean"
            }
        }
    },
    "desc": {
        "type": "text",
    },
    "product": productType,
    "cat_ids": {
        "type": "integer"
    }
};
