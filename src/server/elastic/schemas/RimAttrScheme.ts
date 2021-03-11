import {LOWERCASE_NORMALIZER} from "@server/elastic/schemas/Analysis";

export const RimAttrScheme = {
    "bolts-count": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "short"
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "bolts-spacing": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "short"
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "brand": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "keyword",
                "normalizer": LOWERCASE_NORMALIZER
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "color": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "keyword",
                "normalizer": LOWERCASE_NORMALIZER
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "dia": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "double"
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "diameter": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "short"
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "et": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "short"
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "model": {
        "properties": {
            "name": {
                "type": "text",
            },
            "slug": {
                "type": "keyword",
                "normalizer": LOWERCASE_NORMALIZER
            },
            "value": {
                "type": "keyword",
            }
        }
    },
    "pcd": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "keyword",
                "normalizer": LOWERCASE_NORMALIZER
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "recommended-price": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "scaled_float",
                "scaling_factor": 100
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "type": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "keyword",
                "normalizer": LOWERCASE_NORMALIZER
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "supplier": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "keyword",
                "normalizer": LOWERCASE_NORMALIZER
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "width": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "scaled_float",
                "scaling_factor": 10
            },
            "slug": {
                "type": "keyword"
            }
        }
    },
    "stock": {
        "properties": {
            "value": {
                "type": "nested",
                "properties": {
                    "name": {
                        "type" : "text",
                        "index": false
                    },
                    "shippingTime": {
                        "type" : "text",
                        "index": false
                    },
                    "count": {
                        "type" : "integer",
                        "index": false
                    }
                }
            },
            "name": {
                "type": "text"
            },
            "slug": {
                "type": "keyword"
            }
        }
    }
};
