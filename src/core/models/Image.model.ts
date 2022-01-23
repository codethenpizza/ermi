import {BelongsToMany, Column, HasMany, Model, Table} from "sequelize-typescript";

import ProductVariantImg, {IProductVariantImg} from "@core/models/ProductVariantImg.model";
import ProductVariant, {IProductVariant} from "@core/models/ProductVariant.model";

@Table({
    tableName: 'image',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Image extends Model<Image> implements IImage {

    id: number;

    @Column({
        allowNull: false
    })
    original_uri: string;

    @Column
    large_uri: string;

    @Column
    medium_uri: string;

    @Column
    small_uri: string;

    @Column
    thumbnail_uri: string

    @Column
    name: string;

    @Column
    mimetype: string;

    @Column
    size: number;

    @BelongsToMany(() => ProductVariant, () => ProductVariantImg)
    productVariants?: IProductVariant[];

    @HasMany(() => ProductVariantImg)
    productVariantImgs?: IProductVariantImg[];

}

export interface IImage {
    id: number;
    name: string;
    original_uri: string;
    large_uri?: string;
    medium_uri?: string;
    small_uri?: string;
    thumbnail_uri?: string;
    mimetype?: string;
    size?: number;
    productVariants?: IProductVariant[];
    productVariantImgs?: IProductVariantImg[];
}

export interface IImageCreate extends Omit<IImage, 'id'> {
}
