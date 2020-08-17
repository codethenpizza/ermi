import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import Product from "@models/Product.model";
import AttrValue, {IAttrValue} from "@models/AttrValue.model";

@Table({
    tableName: 'product_variant',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ProductVariant extends Model<ProductVariant> {
    @ForeignKey(() => Product)
    @Column({
        allowNull: false
    })
    product_id: number;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @Column({
        allowNull: false,
        type: DataType.DECIMAL
    })
    price: number;

    @Column({
        type: DataType.DECIMAL
    })
    price_discount: number;

    @Column({
        type: DataType.FLOAT
    })
    weight: number;

    @Column({
        type: DataType.FLOAT,
        defaultValue: 0
    })
    in_stock_qty: number;

    @Column({
        defaultValue: false
    })
    is_available: boolean;

    @Column({
        defaultValue: false
    })
    is_discount: boolean;

    @HasMany(() => AttrValue)
    attrs: AttrValue[];

    @BelongsTo(() => Product)
    product: Product;

    static async CreateOrUpdate(variant: IProductVariant, transaction): Promise<number> {
        if (variant.id) {
            ProductVariant.update(variant, {where: {id: variant.id}, transaction});
            return variant.id
        } else {
            const {id} = await ProductVariant.create(variant, {transaction});
            return id
        }
    }
}

export type IProductVariant = {
    id?: number;
    product_id: number;
    desc: string;
    price: number;
    price_discount: number;
    weight: number;
    in_stock_qty: number;
    is_available: boolean;
    is_discount: boolean;
    attrs: IAttrValue[]
}