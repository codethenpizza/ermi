import {IProductVariant} from "@core/models/ProductVariant.model";
import {IOfferCreateProductData} from "@core/useCases/OfferUseCases/types";
import Product, {IProduct} from "@core/models/Product.model";
import {ProductUseCases} from "@core/useCases/ProductUseCases/ProductUseCases";
import {getAttrValuesHash} from "@core/helpers/utils";
import ProductVariantAttrHash from "@core/models/ProductVariantAttrHash.model";
import {IOfferCreateOptions} from "@core/services/offer/types";
import {Op, Transaction} from "sequelize";

export class OfferRelationFinderService {

    async getProductVariantID(
        data: IOfferCreateProductData,
        productUseCases: ProductUseCases,
        options?: IOfferCreateOptions,
        transaction?: Transaction
    ): Promise<IProductVariant['id']> {
        let productVariantID;
        if (options?.findProductVariantIdFn) {
            productVariantID = await options.findProductVariantIdFn(data, transaction);
        } else {
            productVariantID = await this.findProductVariantIdByAttrsHash(data, transaction);
        }

        if (productVariantID) {
            return productVariantID;
        }

        let productID;
        if (options?.findProductIdFn) {
            productID = await options.findProductIdFn(data, transaction);
        } else {
            productID = await this.findProductIdByName(data, transaction);
        }

        if (productID) {
            const productVariant: IProductVariant = await productUseCases.createVariant(data.productVariant, productID, transaction);
            if (productVariant) {
                return productVariant.id;
            }
        }

        const product: IProduct = await productUseCases.createProduct(data, transaction);
        const productVariant: IProductVariant = await productUseCases.createVariant(data.productVariant, product.id, transaction);

        return productVariant.id;
    }

    private async findProductVariantIdByAttrsHash(data: IOfferCreateProductData, transaction?: Transaction): Promise<IProductVariant['id'] | null> {
        const hash = getAttrValuesHash(data.productVariant.attrs);

        const productVariantAttrHash = await ProductVariantAttrHash.findOne({where: {attrs_hash: hash}, transaction});

        if (productVariantAttrHash) {
            return productVariantAttrHash.product_variant_id;
        }

        return null;
    }

    private async findProductIdByName(data: IOfferCreateProductData, transaction?: Transaction): Promise<IProduct['id'] | null> {
        const product = await Product.findOne({
            where: {
                name: {[Op.substring]: data.name},
            },
            transaction
        });

        if (product) {
            return product.id;
        }
        return null;
    }

}
