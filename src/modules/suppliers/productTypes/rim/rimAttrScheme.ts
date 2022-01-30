import {LOWERCASE_NORMALIZER} from "@core/services/elastic/schemas/normalizers/LowerCase";
import {EsScheme} from "@core/services/elastic/schemas/types";

export const RimAttrScheme: EsScheme.Scheme = {
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "value": {
                "type": "keyword",
                "normalizer": LOWERCASE_NORMALIZER
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
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
            },
            "type": {
                "type": "text"
            }
        }
    },
    "beadlock": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "boolean",
            },
            "slug": {
                "type": "keyword"
            },
            "type": {
                "type": "text"
            }
        }
    },
    "country-of-origin": {
        "properties": {
            "name": {
                "type": "text"
            },
            "value": {
                "type": "text",
            },
            "slug": {
                "type": "keyword"
            },
            "type": {
                "type": "text"
            }
        }
    }
};
