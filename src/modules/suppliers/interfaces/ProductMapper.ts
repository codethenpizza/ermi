import {IAttribute} from "@core/models/Attribute.model";
import {IProductCategory} from "@core/models/ProductCategory.model";
import {IAttrSet} from "@core/models/AttrSet.model";
import {IOfferCreateOptions} from "@core/services/offer/types";
import {OptionsIDMapping} from "../types";

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
    export type IMapPropToAttrName<T = any> = {
        [x in keyof T]: string;
    };

    /**
     * represent set of options for parsing specific product type
     */

    export interface ProductTypeOptions<T = any, K = Omit<OptionsIDMapping, 'cat' | 'attr_set_id'>> {
        method: keyof T; // method which calls in supplier class if exist
        mapping: IMapPropToAttrName<K>; // object which represent relation of raw data and attrs of product
        mappingKey: string; // key which uses for find mapping in data base for specific product type
        attributes: {
            requiredAttrs: Omit<IAttribute, 'id' | 'slug'>[]; // required product attributes
            attrSetName: IAttrSet['name']; // name of attribute set
            attrSetDesc: IAttrSet['desc']; // description of attribute set
            attrSetScheme: IAttrSet['scheme'];
        }
        productCategory: Omit<IProductCategory, 'id'>;

        getProductFindOptionsFns(mapping: OptionsIDMapping): Promise<IOfferCreateOptions>;
    }
}
