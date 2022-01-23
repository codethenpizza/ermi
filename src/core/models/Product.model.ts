import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript"
import ProductVariant, {IProductVariant} from "@core/models/ProductVariant.model";
import ProductCategory, {IProductCategory} from "@core/models/ProductCategory.model";
import ProductCatsProduct, {IProductCatsProduct} from "@core/models/ProductCatsProduct.model";
import AttrSet from "@core/models/AttrSet.model";
import {Includeable} from "sequelize";

@Table({
    tableName: 'product',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Product extends Model<Product> implements IProduct {

    id: number;
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
    cats?: ProductCategory[];
    @HasMany(() => ProductCatsProduct)
    productCatsProduct?: ProductCatsProduct[];
    @HasMany(() => ProductVariant)
    variants?: ProductVariant[];

    static getAllIncludes = (): Includeable[] => [
        ProductVariant,
        AttrSet,
        ProductCategory,
        ProductCatsProduct,
    ];
}


export interface IProduct {
    id: number;
    name: string;
    desc?: string;
    attr_set_id?: number;
    cats?: IProductCategory[];
    productCatsProduct?: IProductCatsProduct[];
    variants?: IProductVariant[];
}

export interface IProductCreate extends Omit<IProduct, 'id' | 'productCatsProduct' | 'cats' | 'variants'> {
    productCatsProduct?: Omit<IProductCatsProduct, 'product_id' | 'id'>[];
}
