import AttrValue from "@core/models/AttrValue.model";
import ProductVariant from "@core/models/ProductVariant.model";
import {sequelizeTs} from "@core/database";
import {TireMapOptions} from "./tireTypes";
import {FindProductIdFn, IOfferCreateOptions} from "@core/services/offer/types";
import ProductCatsProduct from "@core/models/ProductCatsProduct.model";

export const getTireFindOptionsFns = async (mapping: TireMapOptions): Promise<IOfferCreateOptions> => {

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
                     LEFT JOIN ${ProductCatsProduct.tableName} D
                               ON C.product_id = D.product_id
            WHERE A.value = :brand
              AND B.value = :model
              AND D.product_cat_id = :catId
            LIMIT 1
        `, {
            replacements: {
                brand,
                model,
                catId: mapping.cat,
            },
        });

        // @ts-ignore
        const id: string = query[0][0]?.id;
        return id ? parseInt(id) : null;
    };

    return {
        findProductVariantIdFn: null,
        findProductIdFn
    }
};
