import {BelongsToMany, Column, DataType, HasMany, Model, Table} from "sequelize-typescript"
import ProductVariant, {IProductVariant} from "@models/ProductVariant.model";
import AttrValue from "@models/AttrValue.model";
import ProductCategory from "@models/ProductCategory.model";
import ProductCatsProduct from "@models/ProductCatsProduct.model";

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
                    {model: ProductVariant, include: [AttrValue]}
                ]
            });
            await transaction.commit();
            return product;
        } catch (e) {
            await transaction.rollback();
            throw e;
        }
    }
}

export type IProduct = {
    name: string;
    desc?: string;
    cats_ids: number[];
    variants: IProductVariant[];
}