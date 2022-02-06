import {LOWERCASE_NORMALIZER} from "@core/services/elastic/schemas/normalizers/LowerCase";
import {EsScheme} from "@core/services/elastic/schemas/types";
import {commonSlugify} from "@core/helpers/utils";
import {
    RIM_BOLTS_COUNT,
    RIM_BOLTS_SPACING,
    RIM_COLOR,
    RIM_DIA,
    RIM_DIAMETER,
    RIM_MODEL,
    RIM_PCD,
    RIM_TYPE,
    RIM_COUNTRY_OF_ORIGIN,
    RIM_ET,
    RIM_WIDTH, RIM_BEADLOCK
} from "./rimTypes";
import {ATTR_BRAND} from "@core/helpers/productConstants";

export const RimAttrScheme: EsScheme.Scheme = {
    [commonSlugify(RIM_BOLTS_COUNT)]: {
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
    [commonSlugify(RIM_BOLTS_SPACING)]: {
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
    [commonSlugify(ATTR_BRAND)]: {
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
    [commonSlugify(RIM_COLOR)]: {
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
    [commonSlugify(RIM_DIA)]: {
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
    [commonSlugify(RIM_DIAMETER)]: {
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
    [commonSlugify(RIM_ET)]: {
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
    [commonSlugify(RIM_MODEL)]: {
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
    [commonSlugify(RIM_PCD)]: {
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
    [commonSlugify(RIM_TYPE)]: {
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
    [commonSlugify(RIM_WIDTH)]: {
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
    [commonSlugify(RIM_BEADLOCK)]: {
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
    [commonSlugify((RIM_COUNTRY_OF_ORIGIN))]: {
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
