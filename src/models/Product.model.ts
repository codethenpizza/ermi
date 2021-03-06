import {
    BelongsTo,
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    HasOne,
    Model,
    Table
} from "sequelize-typescript"
import ProductVariant, {IProductVariant, IProductVariantUpdateData} from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import ProductCategory from "@models/ProductCategory.model";
import ProductCatsProduct from "@models/ProductCatsProduct.model";
import Attribute from "@models/Attribute.model";
import AttrSet from "@models/AttrSet.model";
import {Op} from "sequelize";
import Image from "@models/Image.model";
import ProductVariantImg from "@models/ProductVariantImg.model";

@Table({
    tableName: 'product',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Product extends Model<Product> {
    @Column({
        allowNull: false
    })
    name: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @ForeignKey(() => AttrSet)
    @Column({
        type: DataType.INTEGER
    })
    attr_set_id: number;

    @BelongsTo(() => AttrSet)
    attrSet: AttrSet;

    @BelongsToMany(() => ProductCategory, () => ProductCatsProduct)
    cats: ProductCategory[];

    @HasMany(() => ProductVariant)
    variants: ProductVariant[];


    static async createWR(data: IProduct): Promise<Product> {
        const transaction = await this.sequelize.transaction();
        try {
            let product = await Product.create(data, {
                transaction, include: [
                    {model: ProductVariant, include: [AttrValue]},
                    ProductCategory
                ]
            });

            for (let i = 0; i < product.variants.length; i++) {
                const variant = data.variants[i];
                if (variant.images) {
                    for (const image of variant.images) {
                        await ProductVariantImg.create({
                            image_id: image.id,
                            product_variant_id: product.variants[i].id
                        }, {transaction});
                    }
                }
            }

            await ProductCatsProduct.bulkCreate(data.cats_ids.map(id => ({product_cat_id: id, product_id: product.id})), {transaction});

            product = await product.reload({
                transaction, include: [
                    {model: ProductVariant, include: [{model: AttrValue, include: [Attribute]}, Image]},
                    ProductCategory
                ]
            });
            await transaction.commit();
            return product;
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    static async updateWR(id: number, product: IProductUpdateData): Promise<void> {
        const transaction = await this.sequelize.transaction();
        try {
            const productUpdateResult = await Product.update(product, {where: {id}});
            if (productUpdateResult[0] === 0) {
                throw new Error(`Can't update product with id ${id}`)
            }

            const variantToDestroy = product.variants.filter(variant => variant.id).map(variant => variant.id);
            ProductVariant.destroy({
                where: {
                    id: {[Op.notIn]: variantToDestroy},
                    product_id: id
                }, transaction
            });

            for (const variant of product.variants) {
                variant.product_id = id;
                await ProductVariant.CreateOrUpdate(variant, transaction);
            }
            await transaction.commit();
        } catch (e) {
            console.error('Product updateWR ERROR', id, product, product.variants, e);
            await transaction.rollback();
            throw e;
        }
    }
}


export type IProduct = {
    id?: number;
    name: string;
    desc?: string;
    cats_ids: number[];
    variants: IProductVariant[];
    attr_set_id?: number;
}

export type IProductUpdateData = {
    id?: number;
    name?: string;
    desc?: string;
    cats_ids?: number[];
    variants?: IProductVariantUpdateData[];
    attr_set_id?: number;
};
