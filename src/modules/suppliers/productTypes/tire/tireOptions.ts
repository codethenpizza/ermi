import {IProductMapper} from "../../interfaces/ProductMapper";
import {
    TIRE_BRAND,
    TIRE_DIAMETER,
    TIRE_MODEL,
    TIRE_PROFILE,
    TIRE_SEASON,
    TIRE_WIDTH,
    TireMap,
    TireMapOptions
} from "./tireTypes";
import {ATTR_TYPE, IAttribute} from "@core/models/Attribute.model";
import {getTireFindOptionsFns} from "./tireFindFunctions";


/**
 * set of tire attrs with enums
 */
export const tireAttrsMapping: IProductMapper.IMapPropToAttrName<TireMap> = {
    model: TIRE_MODEL,
    brand: TIRE_BRAND,
    season: TIRE_SEASON,
    profile: TIRE_PROFILE,
    width: TIRE_WIDTH,
    diameter: TIRE_DIAMETER,
};

export const tireRequiredAttr: Omit<IAttribute, 'id' | 'slug'>[] = [
    {name: TIRE_MODEL, type_id: ATTR_TYPE.STRING},
    {name: TIRE_BRAND, type_id: ATTR_TYPE.STRING, aggregatable: true},
    {name: TIRE_SEASON, type_id: ATTR_TYPE.STRING, aggregatable: true},
    {name: TIRE_PROFILE, type_id: ATTR_TYPE.STRING, aggregatable: true},
    {name: TIRE_WIDTH, type_id: ATTR_TYPE.STRING, aggregatable: true},
    {name: TIRE_DIAMETER, type_id: ATTR_TYPE.STRING, aggregatable: true},
]


/**
 * tire constant defs
 */
const TIRE_PARSE_METHOD = 'getTires'
const TIRE_MAPPING_KEY = 'product_mapping_tire'
const TIRE_ATTR_SET_NAME = 'Tire'
const TIRE_ATTR_SET_DESC = 'Tire attribute set from module'
const TIRE_PRODUCT_CAT_NAME = 'Шины'
const TIRE_PRODUCT_CAT_PARENT_ID = 0

/**
 * tire product type options
 */
export const tireOptions: IProductMapper.ProductTypeOptions<IProductMapper.TireData, Omit<TireMapOptions, 'cat' | 'attr_set_id'>> = {
    method: TIRE_PARSE_METHOD,
    mapping: tireAttrsMapping,
    mappingKey: TIRE_MAPPING_KEY,
    attributes: {
        requiredAttrs: tireRequiredAttr,
        attrSetName: TIRE_ATTR_SET_NAME,
        attrSetDesc: TIRE_ATTR_SET_DESC,
        attrSetScheme: tireAttrsMapping
    },
    productCategory: {
        name: TIRE_PRODUCT_CAT_NAME,
        parent_id: TIRE_PRODUCT_CAT_PARENT_ID
    },
    getProductFindOptionsFns: getTireFindOptionsFns,
};
