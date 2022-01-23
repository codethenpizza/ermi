import {BelongsToMany, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import Product from "@core/models/Product.model";
import ProductCatsProduct from "@core/models/ProductCatsProduct.model";

@Table({
    tableName: 'product_cat',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ProductCategory extends Model<ProductCategory> implements IProductCategory {

    @Column({
        allowNull: false
    })
    name: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @ForeignKey(() => ProductCategory)
    @Column
    parent_id: number;

    @Column({
        defaultValue: 0
    })
    position: number;

    @BelongsToMany(() => Product, () => ProductCatsProduct)
    products: Product[];

}

export type IProductCategory = {
    id?: number;
    name: string;
    desc?: string;
    parent_id?: number;
    position?: number;
};
