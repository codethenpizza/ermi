import Product from "@models/Product.model";
import ProductCategory from "@models/ProductCategory.model";
import ProductVariant from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import Attribute from "@models/Attribute.model";
import AttrType from "@models/AttrType.model";
import Image from "@models/Image.model";
import {EsIndex} from "./EsIndex";
import {EsAttrValue, EsProductVariant, IEsProduct} from "./types";
import {DiskScheme} from "./schemas/DiskScheme";
import {Normalizers} from "@server/elastic/schemas/Analysis";

export const productIndex = 'product';

export class EsProduct extends EsIndex {

    private maxDataItemsInIter = 100;

    constructor() {
        super(productIndex);
    }

    protected createMapping() {
        return DiskScheme;
    }

    protected async createData(storeFn: Function): Promise<void> {
        const total = await ProductVariant.count({where: {is_available: true}});
        if(!total) {
            console.log('No data');
            return;
        }

        if(total < this.maxDataItemsInIter) {
            await storeFn(await this.makeData());
        } else {
            const chunksCount = Math.ceil(total/this.maxDataItemsInIter);
            console.log('Chunks count - ', chunksCount);
            for(let page = 0; page < chunksCount; page++) {
                await storeFn(await this.makeData(page));
                console.log(`Chunk ${page + 1} done`);
            }
        }
    }

    private async makeData(page = 0): Promise<any> {
        const variants = await ProductVariant.findAll({
            offset: this.maxDataItemsInIter * page,
            limit: this.maxDataItemsInIter,
            where: {is_available: true},
            include: [
                {
                    model: AttrValue,
                    include: [{model: Attribute, include: [AttrType]}]
                },
                Image,
                Product
            ]});

        // @ts-ignore
        return variants.map<ProductVariant>(x => x.dataValues).map<EsProductVariant>((variant) => {
            const variantData = {...variant};
            delete variantData.product;
            return {
                ...variantData,
                attrs: this.makeAttrs(variant),
                name: variant.product.name
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

                    case 'json':
                        value = JSON.parse(value);
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

    protected createSettings(): any {
        return {
            analysis: {
                normalizer: Normalizers
            }
        };
    }
}

