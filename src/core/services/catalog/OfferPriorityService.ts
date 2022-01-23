import {Elastic} from "@core/services/elastic/types";
import {IVendorSaleMap, IVendorSaleMapItem} from "@core/services/catalog/types";
import Vendor from "@core/models/Vendor.model";
import {IProductVariant} from "@core/models/ProductVariant.model";
import Offer from "@core/models/Offer.model";
import Attribute from "@core/models/Attribute.model";
import {ATTR_BRAND} from "@core/helpers/productConstants";
import AttrValue, {IAttrValue} from "@core/models/AttrValue.model";
import {Transaction, WhereOptions} from "sequelize";
import {Supplier} from "../../../modules/suppliers/interfaces/Supplier";

export class OfferPriorityService {

    private saleMap: IVendorSaleMap;

    constructor(
        private priorityMap: Record<Supplier['name'], IVendorSaleMapItem>,
        private defaultPrioritySaleValue: number
    ) {
    }

    async chooseOffer(productVariant: Elastic.ProductVariant): Promise<Elastic.ProductVariantFormatted> {
        const offers = productVariant.offers;

        delete productVariant.offers;

        if (offers.length === 1) {
            return {
                ...productVariant,
                offer: offers[0]
            }
        }

        const offer = offers.find((x) => x.priority);

        if (!offer) {
            // ProductVariant offers don't have priority prop
            // TODO choose strategy
            return {
                ...productVariant,
                offer: offers[0]
            }
        }

        delete offer.priority;

        return {
            ...productVariant,
            offer
        }
    }

    async updateOffersPriority(productVariantID: IProductVariant['id'], transaction?: Transaction): Promise<void> {
        const offers = await Offer.findAll({where: {product_variant_id: productVariantID}, transaction});

        if (!offers.length) {
            return;
        }

        const brandAttr = await Attribute.findOne({where: {name: ATTR_BRAND}, transaction});

        if (!brandAttr) {
            // Brand attribute not found
            return;
        }

        const attrValueOptions: Partial<IAttrValue> = {attr_id: brandAttr.id, product_variant_id: productVariantID};
        const brandAttrValue = await AttrValue.findOne({where: {...attrValueOptions} as WhereOptions, transaction});


        if (!brandAttrValue) {
            return;
        }

        const priorityOfferID = await this.getPriorityOfferId(offers, brandAttrValue.value, transaction);

        if (offers.length > 1) {
            await Offer.update({priority: false}, {
                where: {product_variant_id: productVariantID},
                transaction,
                hooks: false,
                individualHooks: false
            });
        }

        await Offer.update({priority: true}, {
            where: {product_variant_id: productVariantID, id: priorityOfferID},
            transaction,
            hooks: false,
            individualHooks: false
        });
    }

    async getPriorityOfferId(offers: Offer[], brand: string, transaction?: Transaction): Promise<number> {
        if (offers.length === 1) {
            return offers[0].id
        }

        const saleMap = await this.getVendorSaleMap(transaction);


        const countMargin = (offer: Offer): number => {
            const {vendor_id, price} = offer;

            const salePercent = saleMap[vendor_id]?.[brand] || this.defaultPrioritySaleValue;

            return price * salePercent;
        };

        const offer = offers.sort((a, b) => countMargin(b) - countMargin(a))[0];

        return offer.id;
    }

    private async getVendorSaleMap(transaction?: Transaction): Promise<IVendorSaleMap> {
        // TODO use cache
        if (this.saleMap) {
            return this.saleMap;
        }

        const vendors = await Vendor.findAll({transaction});

        const saleMap = vendors.reduce<IVendorSaleMap>((map, vendor) => {

            const mapItem = this.priorityMap[vendor.name];
            if (mapItem) {
                map[vendor.id] = mapItem;
            }

            return map;
        }, {});

        this.saleMap = saleMap;

        return saleMap;
    }

}
