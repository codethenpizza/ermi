import {BelongsTo, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript"
import Attribute from "@models/Attribute.model";
import ProductVariant from "@models/ProductVariant.model";


@Table({
    tableName: 'attr_value',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class AttrValue extends Model<AttrValue> {
    @Column({
        allowNull: false,
        type: DataType.TEXT,
    })
    value: string;

    @ForeignKey(() => Attribute)
    @Column
    attr_id: number;

    @ForeignKey(() => ProductVariant)
    @Column
    product_variant_id: number;

    @BelongsTo(() => ProductVariant)
    productVariant: ProductVariant;

    @BelongsTo(() => Attribute, 'attr_id')
    attribute: Attribute;
}

export type IAttrValue = {
    id?: string;
    value: string;
    attr_id: number;
    product_variant_id?: number;
}

export type IAttrValueUpdateData = {
    id?: string;
    value?: string;
    attr_id?: number;
    product_variant_id?: number;
}
