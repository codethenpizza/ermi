import AttrValue from "@core/models/AttrValue.model";
import ProductVariant from "@core/models/ProductVariant.model";
import {sequelizeTs} from "@core/database";
import {RimMapOptions} from "./rimTypes";
import {FindProductIdFn, IOfferCreateOptions} from "@core/services/offer/types";

export const getRimFindOptionsFns = async (mapping: RimMapOptions): Promise<IOfferCreateOptions> => {

    const findProductIdFn: FindProductIdFn = async (data) => {
        const brand = data.productVariant.attrs.find(x => x.attr_id === mapping.brand)?.value;
        const model = data.productVariant.attrs.find(x => x.attr_id === mapping.model)?.value;

        if (!brand || !model) {
            return null;
        }

        const query = await sequelizeTs.query(`
            SELECT C.product_id as id
            FROM ${AttrValue.tableName} A
                     LEFT JOIN ${AttrValue.tableName} B
                               ON A.product_variant_id = B.product_variant_id
                     LEFT JOIN ${ProductVariant.tableName} C
                               ON A.product_variant_id = C.id
            WHERE A.value = :brand
            AND B.value = :model 
            LIMIT 1
        `, {
            replacements: {
                brand,
                model,
            },
        });
        console.log('query', query);
        // @ts-ignore
        const id: string = query[0][0]?.id;
        return id ? parseInt(id) : null;
    };

    return {
        findProductVariantIdFn: null,
        findProductIdFn
    }
};
