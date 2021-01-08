import Product from "@models/Product.model";
import ProductCategory from "@models/ProductCategory.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import Attribute from "@models/Attribute.model";
import AttrType from "@models/AttrType.model";
import Image from "@models/Image.model";
import {EsIndex} from "./EsIndex";
import {EsAttrValue, EsProductVariant, IEsProduct} from "./types";
import {ProductScheme} from "./schemas/ProductScheme";

export const productIndex = 'product';

export class EsProduct extends EsIndex {

    constructor() {
        super(productIndex);
    }

    protected createMapping() {
        return ProductScheme;
    }

    protected async createData(): Promise<EsProductVariant[]> {
        const variants = await ProductVariant.findAll({where: {is_available: true},
            include: [
                {
                    model: AttrValue,
                    include: [{model: Attribute, include: [AttrType]}]
                },
                Image
            ]});

        // @ts-ignore
        return variants.map(x => x.dataValues).map<EsProductVariant>((variant) => {
            return {
                ...variant,
                price: parseInt(variant.price),
                attrs: this.makeAttrs(variant)
            };
        })
    }


    private makeAttrs(variant: ProductVariant): EsAttrValue[] {
        // @ts-ignore
        return variant.attrs.map(x => x.dataValues)
            .reduce((obj, attr) => {
                let value = attr.value;

                switch (attr.attribute.type.type) {
                    case 'decimal':
                        value = parseFloat(value);
                        break;

                    case 'number':
                        value = parseInt(value);
                        break;
                }

                obj[attr.attribute.slug] = {
                    value,
                    name: attr.attribute.name,
                    slug: attr.attribute.slug
                };
                return obj;
            }, {});
    }
}

