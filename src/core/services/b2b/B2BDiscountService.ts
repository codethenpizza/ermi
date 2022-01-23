import B2BDiscount, {IB2BDiscount} from "@core/models/B2BDiscount.model";
import {Transaction} from "sequelize";
import User, {IUser} from "@core/models/User.model";
import B2BDiscountGroup, {IB2BDiscountGroup} from "@core/models/B2BDiscountGroup.model";
import Order from "@core/models/Order.model";
import {isArray, isEqual} from 'lodash';
import {Elastic} from "@core/services/elastic/types";
import {IOffer} from "@core/models/Offer.model";
import Attribute from "@core/models/Attribute.model";

export class B2BDiscountService {

    static focusedAttr = 'brand';

    async createDiscountGroup(
        discountGroup: B2BDiscountGroup,
        transaction?: Transaction
    ): Promise<IB2BDiscountGroup> {
        const discount = await B2BDiscount.create(
            discountGroup.discount,
            {transaction}
        );

        const newDiscountGroup = await B2BDiscountGroup.create({
            ...discountGroup,
            b2b_discount_id: discount.id
        }, {transaction});

        return newDiscountGroup.reload({include: [B2BDiscount], transaction});
    }

    async updateDiscountGroup(id: number, data: IB2BDiscountGroup, transaction?: Transaction): Promise<IB2BDiscountGroup> {
        let discountGroup = await B2BDiscountGroup.findByPk(id, {transaction});
        let discountID = data.discount.id;

        const discount = await B2BDiscount.findByPk(data.discount.id, {raw: true, transaction});

        if (!isEqual(discount, data.discount)) {
            const isDiscountUsed = await Order.findOne({
                where: {b2b_discount_id: discountID},
                raw: true,
                transaction
            });

            if (isDiscountUsed) {
                await this.deactivate(data.discount.id, transaction);
                const newDiscount = await B2BDiscount.create(
                    data.discount,
                    {transaction}
                );

                discountID = newDiscount.id;
            } else {
                const discount = await B2BDiscount.findByPk(discountID, {transaction});
                await discount.update(data.discount, {transaction});
            }
        }

        discountGroup = await discountGroup.update({
            ...data,
            b2b_discount_id: discountID
        } as IB2BDiscountGroup, {transaction});

        return discountGroup.reload({include: [B2BDiscount], transaction});
    }

    async deleteDiscountGroup(id: number, transaction?: Transaction): Promise<void> {
        const discountGroup = await B2BDiscountGroup.findByPk(id, {transaction});
        const discount = await B2BDiscount.findByPk(discountGroup.b2b_discount_id, {transaction});

        discount.active = false;
        await discount.save({transaction})

        await discountGroup.destroy({transaction});
    }

    async deactivate(id: number, transaction?: Transaction): Promise<IB2BDiscount> {
        const prevVersion = await B2BDiscount.findByPk(id, {transaction});
        prevVersion.active = false;
        return prevVersion.save({transaction});
    }

    async enrichESProductByB2BUserDiscount(
        user: Partial<IUser> | IUser,
        productVariants: Elastic.ProductVariantFormatted | Elastic.ProductVariantFormatted[],
        transaction?: Transaction
    ): Promise<Elastic.ProductVariantFormatted | Elastic.ProductVariantFormatted[]> {
        if (!user.b2b_discount_group_id) {
            throw new Error('Not a B2B user');
        }

        const discountGroup = await B2BDiscountGroup.findByPk(user.b2b_discount_group_id, {
            include: [B2BDiscount],
            transaction
        });
        return this.enrichESProductByB2BDiscount(discountGroup.discount, productVariants);
    }

    async enrichESProductByB2BDiscount(
        discount: IB2BDiscount,
        productVariants: Elastic.ProductVariantFormatted | Elastic.ProductVariantFormatted[],
    ): Promise<Elastic.ProductVariantFormatted | Elastic.ProductVariantFormatted[]> {
        const discountPattern = discount.pattern;

        const enrichProduct = (productVariant: Elastic.ProductVariantFormatted): Elastic.ProductVariantFormatted => {
            const key = productVariant.attrs[B2BDiscountService.focusedAttr]?.value as string;
            const value = discountPattern[key]?.value;

            if (value) {
                productVariant.offer.discount_price = productVariant.offer.price * value;
            }

            return productVariant;
        }

        if (isArray(productVariants)) {
            return productVariants.map(enrichProduct);
        } else {
            return enrichProduct(productVariants);
        }
    }

    async enrichOfferByB2BUserDiscount(
        user: Partial<User>,
        offers: IOffer | IOffer[],
        transaction?: Transaction
    ): Promise<IOffer | IOffer[]> {
        if (!user.b2b_discount_group_id) {
            throw new Error('Not a B2B user');
        }

        const discountGroup = await B2BDiscountGroup.findByPk(user.b2b_discount_group_id, {
            include: [B2BDiscount],
            transaction
        });
        const discountPattern = discountGroup.discount.pattern;

        const attr = await Attribute.findOne({where: {slug: B2BDiscountService.focusedAttr}, transaction});

        const enrichProduct = (offer: IOffer): IOffer => {
            const key = offer.productVariant.attrs.find(x => x.attr_id === attr.id)?.value;
            if (key) {
                const value = discountPattern[key]?.value;
                if (value) {
                    offer.discount_price = offer.price * value;
                }
            }

            return offer;
        }

        if (isArray(offers)) {
            return offers.map(enrichProduct);
        } else {
            return enrichProduct(offers);
        }
    }

}
