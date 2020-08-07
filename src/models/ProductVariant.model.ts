import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import Product from "@models/Product.model";
import AttrValue from "@models/AttrValue.model";

@Table({
    tableName: 'product_variant',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ProductVariant extends Model<ProductVariant> {
    @ForeignKey(() => Product)
    @Column
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

}

export type IProductVariant = {
    product_id: number;
    desc: string;
    price: number;
    price_discount: number;
    weight: number;
    in_stock_qty: number;
    is_available: boolean;
    is_discount: boolean;
    attrs: { attr_id: number, value: string }[]
}