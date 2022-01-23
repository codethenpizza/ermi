import {IOffer} from "@core/models/Offer.model";
import {Elastic} from "@core/services/elastic/types";
import {mapImagesToEsImages} from "@core/services/elastic/adapters/MapImageToEsImage";
import {Stock} from "../../../../modules/suppliers/productTypes/rim/rimTypes";

export const mapOfferToEsOffer = (offer: IOffer): Elastic.Offer => {

    const images = offer.images ? mapImagesToEsImages(offer.images, offer.offerImages) : [];

    const stock: Stock[] = JSON.parse(offer.stock) || []; // TODO create a table for the stock

    return {
        id: offer.id,
        in_stock_qty: offer.in_stock_qty,
        is_available: offer.is_available,
        price: offer.price,
        product_variant_id: offer.product_variant_id,
        vendor_code: offer.vendor_code,
        vendor_id: offer.vendor_id,
        discount_price: offer.discount_price,
        images,
        stock,
        priority: offer.priority
    }
}
