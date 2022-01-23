import {IProductVariant} from "@core/models/ProductVariant.model";
import {IProduct} from "@core/models/Product.model";
import {IOfferCreateProductData} from "@core/useCases/OfferUseCases/types";
import {Transaction} from "sequelize";

export interface IOfferCreateOptions {
    findProductVariantIdFn?: FindProductVariantIdFn;
    findProductIdFn?: FindProductIdFn;
}

export type FindProductVariantIdFn = (data: IOfferCreateProductData, transaction?: Transaction) => Promise<IProductVariant['id'] | null>;

export type FindProductIdFn = (data: IOfferCreateProductData, transaction?: Transaction) => Promise<IProduct['id'] | null>;
