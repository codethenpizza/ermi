import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Image from "@core/models/Image.model";
import ProductVariant from "@core/models/ProductVariant.model";
import {ImageToEntity} from "@core/models/types";

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

export interface IProductVariantImg extends ImageToEntity {
    product_variant_id: number;
}
