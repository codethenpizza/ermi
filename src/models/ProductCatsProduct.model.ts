import {Column, ForeignKey, Model, Table} from "sequelize-typescript"
import ProductCategory from "@models/ProductCategory.model";
import Product from "@models/Product.model";


@Table({
    tableName: 'product_cats_product',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ProductCatsProduct extends Model<ProductCatsProduct> {
    @ForeignKey(() => ProductCategory)
    @Column
    product_cat_id: number;

    @ForeignKey(() => Product)
    @Column
    product_id: number;

}

export interface IProductCatsProduct {
    product_cat_id: number;
    product_id: number;
}
