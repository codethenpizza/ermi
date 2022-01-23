import {IOfferUpdateData} from "@core/useCases/OfferUseCases/types";

export class OfferNotFound extends Error {
    constructor(data: IOfferUpdateData) {
        super(`Can't find offer with vendor_id = ${data.vendor_id} and vendor_code = ${data.vendor_code}`);
    }
}
