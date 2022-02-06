import {EsScheme} from "@core/services/elastic/schemas/types";
import {commonSlugify} from "@core/helpers/utils";
import {TIRE_MODEL, TIRE_DIAMETER, TIRE_WIDTH, TIRE_PROFILE, TIRE_SEASON, TIRE_BRAND} from "./tireTypes";
import {LOWERCASE_NORMALIZER} from "@core/services/elastic/schemas/normalizers/LowerCase";

export const TireAttrScheme: EsScheme.Scheme = {
    [commonSlugify(TIRE_MODEL)]: {
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
    [commonSlugify(TIRE_BRAND)]: {
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
    [commonSlugify(TIRE_WIDTH)]: {
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
    [commonSlugify(TIRE_PROFILE)]: {
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
    [commonSlugify(TIRE_DIAMETER)]: {
      "properties": {
          "name": {
              "type": "text"
          },
          "value": {
              "type": "keyword"
          },
          "slug": {
              "type": "keyword"
          },
          "type": {
              "type": "text"
          }
      }
    },
    [commonSlugify(TIRE_SEASON)]: {
      "properties": {
          "name": {
              "type": "text"
          },
          "value": {
              "type": "keyword"
          },
          "slug": {
              "type": "keyword"
          },
          "type": {
              "type": "text"
          }
      }
    },
}
