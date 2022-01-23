import {IProductVariant} from "@core/models/ProductVariant.model";
import {Elastic} from "@core/services/elastic/types";
import {mapAttrValueToEsAttribute} from "@core/services/elastic/adapters/MapAttrValueToEsAttribute";
import {mapImagesToEsImages} from "@core/services/elastic/adapters/MapImageToEsImage";
import {mapOfferToEsOffer} from "@core/services/elastic/adapters/MapOfferToEsOffer";
import {mapProductToEsProduct} from "@core/services/elastic/adapters/MapProductToEsProduct";

export const mapProductVariantToEsProductVariant = (variant: IProductVariant): Elastic.ProductVariant => {

    if (!variant?.product?.cats?.length) {
        throw new Error(`
            MapProductVariantToEsProductVariant adapter ERROR: field "variant.product.cats" in ProductVariant is required.
            ProductVariant - ${JSON.stringify(variant, null, 2)}
        `)
    }

    const attrs = variant.attrs.reduce<Elastic.Attributes>((acc, attrValue) => {
        const esAttr = mapAttrValueToEsAttribute(attrValue);
        acc[esAttr.slug] = esAttr;
        return acc;
    }, {});

    const images = variant.images ? mapImagesToEsImages(variant.images, variant.productVariantImgs) : [];

    const offers = variant?.offers.map(mapOfferToEsOffer) || [];

    const product = mapProductToEsProduct(variant.product);

    return {
        id: variant.id,
        attrs,
        cat_ids: variant.product.cats.map(x => x.id),
        desc: variant.desc,
        images,
        is_available: variant.is_available,
        name: variant.product.name,
        offers,
        product_id: variant.product.id,
        variant_code: variant.variant_code,
        product
    };
}
