import Product from "@models/Product.model";
import ProductCategory from "@models/ProductCategory.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import Attribute from "@models/Attribute.model";
import AttrType from "@models/AttrType.model";
import {EsIndex} from "./EsIndex";
import {EsProductVariant, IEsProduct} from "./types";
import {ProductScheme} from "./schemas/ProductScheme";
import {elastic} from 'config';


export const productType = 'product';

export class EsProduct extends EsIndex {

    constructor() {
        super(elastic.index, productType);
    }

    protected createMapping() {
        return ProductScheme;
    }

    protected async createData(): Promise<IEsProduct[]> {
        const products = await Product.findAll({
            include: [
                ProductCategory,
                {
                    model: ProductVariant,
                    include: [{model: AttrValue, include: [{model: Attribute, include: [AttrType]}]}]
                }
            ]
        });

        // @ts-ignore
        return products.map(x => x.dataValues).map((prod) => {
            return {
                ...prod,
                cats_ids: prod.cats.map(c => c.id),
                variants: prod.variants.map(x => x.dataValues).map<EsProductVariant>((variant) => {
                    return {
                        ...variant,
                        price: parseInt(variant.price),
                        attrs: variant.attrs.map(x => x.dataValues)
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
                            }, {})
                    };
                })
            };
        });
    }


}

