import {IOfferCreateData} from "@core/useCases/OfferUseCases/types";
import {IOffer} from "@core/models/Offer.model";
import {createMockVendor} from "./createMockVendor";
import {getRandomNumber} from "./utils";
import {createMockProductVariant} from "./createMockProductVariant";
import {ICreateMockOfferData} from "./types";
import {Stock} from "../../modules/suppliers/productTypes/rim/rimTypes";

export const createMockOffer = async (
    {
        offerUseCases,
        productUseCases,
        data,
        productVariantID,
        productVariantData,
        vendorID,
        vendorData,
        transaction
    }: ICreateMockOfferData): Promise<IOffer> => {

    if (!vendorID) {
        const vendor = await createMockVendor(vendorData, transaction);
        vendorID = vendor.id;
    }

    if (!productVariantID) {
        const productVariant = await createMockProductVariant(productUseCases, productVariantData, transaction);
        productVariantID = productVariant.id;
    }

    const inStockQty = Math.max(1, getRandomNumber(2));

    const stock: Stock[] = [
        {
            count: inStockQty,
            name: 'TestStock',
            shippingTime: {
                from: 1,
                to: 3
            }
        }
    ];

    const offerData: IOfferCreateData = data || {
        price: getRandomNumber(),
        is_available: true,
        in_stock_qty: inStockQty,
        vendor_id: vendorID,
        vendor_code: getRandomNumber().toString(),
        stock: JSON.stringify(stock)
    };
    return offerUseCases.create(offerData, productVariantID, null, transaction);
}
