import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Image from "@models/Image.model";
import ProductVariant from "@models/ProductVariant.model";

@Table({
    tableName: 'product_variant_image',
    timestamps: false
})
export default class ProductVariantImg extends Model<ProductVariantImg> {

    @ForeignKey(() => Image)
    @Column
    image_id: number;

    @ForeignKey(() => ProductVariant)
    @Column
    product_variant_id: number;

    @Column({
        defaultValue: 0
    })
    position: number;

}

export interface IProductVariantImg {
    image_id: number;
    product_variant_id: number;
    position?: number;
}
