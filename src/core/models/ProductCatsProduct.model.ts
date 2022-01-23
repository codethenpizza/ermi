import {Column, ForeignKey, Model, Table} from "sequelize-typescript"
import ProductCategory from "@core/models/ProductCategory.model";
import Product from "@core/models/Product.model";


@Table({
    tableName: 'product_cats_product',
    timestamps: false
})
export default class ProductCatsProduct extends Model<ProductCatsProduct> implements IProductCatsProduct {

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
