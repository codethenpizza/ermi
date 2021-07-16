import {ATTR_TYPE, IAttribute} from "@models/Attribute.model";
import {
    RIM_BOLTS_COUNT,
    RIM_BOLTS_SPACING,
    RIM_BRAND,
    RIM_COLOR, RIM_DIA,
    RIM_DIAMETER,
    RIM_ET,
    RIM_MODEL, RIM_PCD, RIM_SUPPLIER, RIM_SUPPLIER_STOCK, RIM_TYPE,
    RIM_WIDTH, RimMapOptions
} from "./rimTypes";
import {IProductMapper} from "../../interfaces/ProductMapper";

/**
 * set of rim attrs with enums
 */
export const rimAttrsMapping: IProductMapper.IMapPropToAttrName = {
    model: RIM_MODEL,
    brand: RIM_BRAND,
    color: RIM_COLOR,
    width: RIM_WIDTH,
    et: RIM_ET,
    diameter: RIM_DIAMETER,
    bolts_count: RIM_BOLTS_COUNT,
    bolts_spacing: RIM_BOLTS_SPACING,
    pcd: RIM_PCD,
    dia: RIM_DIA,
    type: RIM_TYPE,
    supplier: RIM_SUPPLIER,
    stock: RIM_SUPPLIER_STOCK
}

/**
 * set of rim required attrs plus options for a different product types
 */
export const rimRequiredAttr: IAttribute[] = [
    {name: RIM_MODEL, type_id: ATTR_TYPE.STRING},
    {name: RIM_BRAND, type_id: ATTR_TYPE.STRING, aggregatable: true},
    {name: RIM_COLOR, type_id: ATTR_TYPE.STRING, aggregatable: true},
    {name: RIM_WIDTH, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ШИРИНА ДИСКА
    {name: RIM_ET, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ВЫЛЕТ
    {name: RIM_DIAMETER, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, //ДИАМЕТР ДИСКА
    {name: RIM_BOLTS_COUNT, type_id: ATTR_TYPE.NUMBER}, //КОЛ-ВО ОТВЕРСТИЙ
    {name: RIM_BOLTS_SPACING, type_id: ATTR_TYPE.DECIMAL}, //ДИАМЕТР ОКРУЖНОСТИ
    {name: RIM_PCD, type_id: ATTR_TYPE.STRING, aggregatable: true}, //ДИАМЕТР ОКРУЖНОСТИ x КОЛ-ВО ОТВЕРСТИЙ
    {name: RIM_DIA, type_id: ATTR_TYPE.DECIMAL, aggregatable: true}, // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
    {name: RIM_TYPE, type_id: ATTR_TYPE.STRING, aggregatable: true},
    {name: RIM_SUPPLIER, type_id: ATTR_TYPE.STRING},
    {
        name: RIM_SUPPLIER_STOCK,
        type_id: ATTR_TYPE.ARRAY,
        aggregatable: true,
        aggPath: 'shippingTime'
    },
];

/**
 * rim constant defs
 */
const RIM_PARSE_METHOD = 'getRims';
const RIM_MAPPING_KEY = 'product_mapping_rim';

const RIM_ATTR_SET_NAME = 'Rim'
const RIM_ATTR_SET_DESC = 'Rim attribute set from module'
const RIM_PRODUCT_CAT_NAME = 'rims_test'
const RIM_PRODUCT_CAT_PARENT_ID = 0


/**
 * set of ProductMapper required options
 */
export const rimMapperRequiredOptions: IProductMapper.MapItem<IProductMapper.RimData, RimMapOptions> = {
    method: RIM_PARSE_METHOD,
    mapping: rimAttrsMapping,
    mappingKey: RIM_MAPPING_KEY,
    attributes: {
        requiredAttrs: rimRequiredAttr,
        attrSetName: RIM_ATTR_SET_NAME,
        attrSetDesc: RIM_ATTR_SET_DESC
    },
    productCategory: {
        name: RIM_PRODUCT_CAT_NAME,
        parent_id: RIM_PRODUCT_CAT_PARENT_ID
    }
}
