import {BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript"
import ProductVariant, {IProductVariant} from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import ProductCategory from "@models/ProductCategory.model";
import ProductCatsProduct from "@models/ProductCatsProduct.model";
import Attribute from "@models/Attribute.model";
import AttrSet from "@models/AttrSet.model";
import {Op} from "sequelize";

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
        unique: true,
        allowNull: false,
    })
    artikul: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @ForeignKey(() => AttrSet)
    @Column({
        type: DataType.INTEGER
    })
    attr_set_id: number;

    @BelongsToMany(() => ProductCategory, () => ProductCatsProduct)
    cats: ProductCategory[];

    @HasMany(() => ProductVariant)
    variants: ProductVariant[];


    static async createWR(data: IProduct): Promise<Product> {
        const transaction = await this.sequelize.transaction();
        try {
            let product = await Product.create(data, {
                transaction, include: [
                    {model: ProductVariant, include: [AttrValue]}
                ]
            });

            product = await product.reload({
                transaction, include: [
                    {model: ProductVariant, include: [{model: AttrValue, include: [Attribute]}]}
                ]
            });
            await transaction.commit();
            return product;
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    static async updateWR(id:number, product: IProduct): Promise<void> {
        const transaction = await this.sequelize.transaction();
        try {
            const productUpdateResult = await Product.update(product, {where: {id}});
            if (productUpdateResult[0] === 0) {
                throw new Error(`Can't update product with id ${id}`)
            }
            
            const variantToDestroy = product.variants.filter(variant => variant.id).map(variant => variant.id);
            ProductVariant.destroy({where: {id: {[Op.notIn]: variantToDestroy}}, transaction});

            for (const variant of product.variants) {
                variant.product_id = id;
                const variantId = await ProductVariant.CreateOrUpdate(variant, transaction);
                variant.attrs.forEach(attr => {
                    attr.product_variant_id = variantId
                });
                await AttrValue.bulkCreate(variant.attrs, {transaction})
            }
            await transaction.commit();
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
}


export type IProduct = {
    id?: number;
    name: string;
    desc?: string;
    artikul: string
    cats_ids: number[];
    variants: IProductVariant[];
}