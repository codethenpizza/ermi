import {IAttribute} from "@models/Attribute.model";
import {IProductCategory} from "@models/ProductCategory.model";

export namespace IProductMapper {

    /**
     * type %PRODUCT_TYPE%Data represent method which should be implemented in supplier class
     */

    export type RimData = {
        getRims: (limit: number, offset: number) => void
    };

    export type TireData = {
        getTires: (limit: number, offset: number) => void
    };

    /**
     * type %PRODUCT_TYPE%Data represent method which should be implemented in supplier class
     */

   export interface IMapPropToAttrName<T = {[key: string]: any }> {
        // @ts-ignore
        [x: keyof T]: string;
    }

    /**
     * represent set of options for parsing specific product type
     */

    export interface MapItem<T = any, K = any> {
        method: keyof T; // method which calls in supplier class if exist
        mapping: IMapPropToAttrName<K>; // object which represent relation of raw data and attrs of product
        mappingKey: string; // key which uses for find mapping in data base for specific product type
        attributes: {
            requiredAttrs: IAttribute[]; // required product attributes
            attrSetName: string; // name of attribute set
            attrSetDesc: string; // description of attribute set
        }
        productCategory: IProductCategory
    }
}
