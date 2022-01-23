import Offer from "@core/models/Offer.model";
import {Transaction} from "sequelize";
import {IOfferCreateData} from "@core/useCases/OfferUseCases/types";

export class VendorOfferAlreadyExistsInVariant extends Error {
    constructor(
        public offerDataToCreate: IOfferCreateData,
        public existedOffer: Offer,
        public transaction?: Transaction
    ) {
        super(`
Create offer error: 
Can't create offer (vendor_code = ${offerDataToCreate.vendor_code})
Product variant (id = ${existedOffer.product_variant_id}) already has an offer from vendor (id = ${existedOffer.vendor_id}) with vendor_code = ${existedOffer.vendor_code}
`);
    }
}
