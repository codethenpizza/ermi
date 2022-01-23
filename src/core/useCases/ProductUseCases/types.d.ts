import {IProductVariantCreate} from "@core/models/ProductVariant.model";
import {ImageToEntity} from "@core/models/types";
import {IProductCreate} from "@core/models/Product.model";

export interface IProductCreateData extends Omit<IProductCreate, 'productCatsProduct'> {
    cat_ids: number[];
}

export interface IProductUpdateData extends IProductCreateData {
    id: number;
}

export interface IProductVariantCreateData extends Omit<IProductVariantCreate, 'productVariantImgs' | 'product_id'> {
    images: ImageToEntity[];
}

export interface IProductVariantUpdateData extends Omit<IProductVariantCreateData, 'attrs' | 'images'> {
    id: number;
    images?: IProductVariantCreateData['images'];
    attrs?: IProductVariantCreateData['attrs'];
}
