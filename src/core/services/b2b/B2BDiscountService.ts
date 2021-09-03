import B2BDiscount, {IB2BDiscount} from "@models/B2BDiscount.model";
import {Transaction} from "sequelize";
import User, {IUser} from "@models/User.model";
import {EsProductVariant} from "@actions/front/types";
import B2BDiscountGroup, {IB2BDiscountGroup} from "@models/B2BDiscountGroup.model";
import Order from "@models/Order.model";
import {isArray, isEqual} from 'lodash';
import ProductVariant from "@models/ProductVariant.model";
import Attribute from "@models/Attribute.model";

export class B2BDiscountService {

    private static focusedAttr = 'brand';

    static async createDiscountGroup(
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

    static async updateDiscountGroup(id: number, data: IB2BDiscountGroup, transaction?: Transaction): Promise<IB2BDiscountGroup> {
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

    static async deleteDiscountGroup(id: number, transaction?: Transaction): Promise<void> {
        const discountGroup = await B2BDiscountGroup.findByPk(id, {transaction});
        const discount = await B2BDiscount.findByPk(discountGroup.b2b_discount_id, {transaction});

        discount.active = false;
        await discount.save({transaction})

        await discountGroup.destroy({transaction});
    }

    static async deactivate(id: number, transaction?: Transaction): Promise<IB2BDiscount> {
        const prevVersion = await B2BDiscount.findByPk(id, {transaction});
        prevVersion.active = false;
        return prevVersion.save({transaction});
    }

    static async enrichESProductByB2BUserDiscount(
        user: Partial<User> | IUser,
        productVariants: EsProductVariant | EsProductVariant[],
        transaction?: Transaction
    ): Promise<EsProductVariant | EsProductVariant[]> {
        if (!user.b2b_discount_group_id) {
            throw new Error('Not a B2B user');
        }

        const discountGroup = await B2BDiscountGroup.findByPk(user.b2b_discount_group_id, {
            include: [B2BDiscount],
            transaction
        });
        return this.enrichESProductByB2BDiscount(discountGroup.discount, productVariants);
    }

    static async enrichESProductByB2BDiscount(
        discount: B2BDiscount,
        productVariants: EsProductVariant | EsProductVariant[],
    ): Promise<EsProductVariant | EsProductVariant[]> {
        const discountPattern = discount.pattern;

        const enrichProduct = (productVariant: EsProductVariant): EsProductVariant => {
            const key = productVariant.attrs[this.focusedAttr]?.value as string;
            const value = discountPattern[key]?.value;

            if (value) {
                productVariant.price_discount = productVariant.price * value;
            }

            return productVariant;
        }

        if (isArray(productVariants)) {
            return productVariants.map(enrichProduct);
        } else {
            return enrichProduct(productVariants);
        }
    }

    static async enrichProductByB2BUserDiscount(
        user: Partial<User>,
        productVariants: ProductVariant | ProductVariant[]
    ): Promise<ProductVariant | ProductVariant[]> {
        if (!user.b2b_discount_group_id) {
            throw new Error('Not a B2B user');
        }

        const discountGroup = await B2BDiscountGroup.findByPk(user.b2b_discount_group_id, {include: [B2BDiscount]});
        const discountPattern = discountGroup.discount.pattern;

        const attr = await Attribute.findOne({where: {slug: this.focusedAttr}});

        const enrichProduct = (productVariant: ProductVariant): ProductVariant => {
            const key = productVariant.attrs.find(x => x.attr_id === attr.id)?.value;
            if (key) {
                const value = discountPattern[key]?.value;
                if (value) {
                    productVariant.price_discount = productVariant.price * value;
                }
            }

            return productVariant;
        }

        if (isArray(productVariants)) {
            return productVariants.map(enrichProduct);
        } else {
            return enrichProduct(productVariants);
        }
    }

}
