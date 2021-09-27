import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript"
import ProductVariant, {IProductVariant, IProductVariantUpdateData} from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import ProductCategory from "@models/ProductCategory.model";
import ProductCatsProduct, {IProductCatsProduct} from "@models/ProductCatsProduct.model";
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

    @HasMany(() => ProductCatsProduct)
    productCatsProduct: ProductCatsProduct[];

    @HasMany(() => ProductVariant)
    variants: ProductVariant[];


    static async createWR(data: IProduct): Promise<Product> {
        const transaction = await this.sequelize.transaction();
        try {
            const productCatsProduct: Partial<IProductCatsProduct>[] = data.cats_ids.map(product_cat_id => ({product_cat_id}));

            let product = await Product.create({...data, productCatsProduct}, {
                include: [
                    {model: ProductVariant, include: [AttrValue, ProductVariantImg]},
                    ProductCatsProduct
                ],
                transaction
            });

            product = await product.reload({
                include: [
                    {model: ProductVariant, include: [{model: AttrValue, include: [Attribute]}, Image]},
                    ProductCategory
                ],
                transaction
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
            const prod = await Product.findByPk(id);
            if (!prod) {
                throw new Error(`Can't update product with id ${id}`)
            }
            await prod.update(product);

            const variantToDestroy = product.variants.filter(variant => variant.id).map(variant => variant.id);
            ProductVariant.destroy({
                where: {
                    id: {[Op.notIn]: variantToDestroy},
                    product_id: id
                }, transaction
            });

            for (const variant of product.variants) {
                variant.product_id = id;
                await ProductVariant.createOrUpdate(variant, transaction);
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
    productCatsProduct?: ProductCatsProduct[];
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
