import {IOfferCreate} from "@core/models/Offer.model";
import {ImageToEntity} from "@core/models/types";
import {IProductVariant} from "@core/models/ProductVariant.model";
import {IProductCreateData, IProductVariantCreateData} from "@core/useCases/ProductUseCases/types";

export interface IOfferCreateData extends Omit<IOfferCreate, 'product_variant_id' | 'offerImages'> {
    images?: ImageToEntity[];
    imageUrls?: string[];
}

export interface IOfferCreateProductData extends IProductCreateData {
    productVariant: IProductVariantCreateData & { id?: IProductVariant['id'] }
}

export interface IOfferUpdateData extends IOfferCreateData {
    id?: number;
}
