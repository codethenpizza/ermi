import {OfferUseCases} from "@core/useCases/OfferUseCases/OfferUseCases";
import {ProductUseCases} from "@core/useCases/ProductUseCases/ProductUseCases";
import {IOfferCreateData} from "@core/useCases/OfferUseCases/types";
import {Transaction} from "sequelize";
import {IVendorCreate} from "@core/models/Vendor.model";
import {IProductVariantCreateData} from "@core/useCases/ProductUseCases/types";

export interface ICreateMockOfferData {
    offerUseCases: OfferUseCases;
    productUseCases: ProductUseCases;
    data?: IOfferCreateData;
    vendorData?: IVendorCreate;
    vendorID?: number;
    productVariantID?: number;
    productVariantData?: IProductVariantCreateData;
    transaction?: Transaction;
}
