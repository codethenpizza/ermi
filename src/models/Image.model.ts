import {BelongsToMany, Column, Model, Table} from "sequelize-typescript";
import {UploadedFile} from "express-fileupload";
import sharp from 'sharp';
import {images} from 'config';
import {Transaction} from "sequelize";
import slugify from "slugify";

import ProductVariantImg from "@models/ProductVariantImg.model";
import ProductVariant from "@models/ProductVariant.model";
import {FileStrategyHelper} from "@core/files/FileStrategy";

import {splitImageNameByExt} from "../helpers/utils";


@Table({
    tableName: 'image',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Image extends Model<Image> {

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
    thumbnail_uri: string;

    @Column
    name: string;

    @Column
    mimetype: string;

    @Column
    size: number;

    @BelongsToMany(() => ProductVariant, () => ProductVariantImg)
    productVariants: ProductVariant[];

    static async uploadFile(
        {
            name,
            data,
            size,
            mimetype
        }: Partial<UploadedFile>, transaction?: Transaction): Promise<Image> {
        const strategy = FileStrategyHelper.getInstance();

        const {name: normalName, ext} = splitImageNameByExt(slugify(name, {lower: true}));


        const [
            largeData,
            mediumData,
            smallData,
            thumbnailData
        ] = await Promise.all([
            Image.resizeImage(data, "large"),
            Image.resizeImage(data, "medium"),
            Image.resizeImage(data, "small"),
            Image.resizeImage(data, "thumbnail")
        ]);

        const [
            original_uri,
            large_uri,
            medium_uri,
            small_uri,
            thumbnail_uri
        ] = await Promise.all([
            strategy.create(data, `${normalName}.${ext}`),
            strategy.create(largeData, `${normalName}.large.${ext}`),
            strategy.create(mediumData, `${normalName}.medium.${ext}`),
            strategy.create(smallData, `${normalName}.small.${ext}`),
            strategy.create(thumbnailData, `${normalName}.thumbnail.${ext}`)
        ]);

        return Image.create({
            original_uri,
            large_uri,
            medium_uri,
            small_uri,
            thumbnail_uri,
            name,
            size,
            mimetype
        }, {transaction});
    }

    static resizeImage(data: Buffer, type: 'large' | 'medium' | 'small' | 'thumbnail', quality = 75): Promise<Buffer> {
        const {width, height} = images.sizes[type];
        return sharp(data)
            .resize(width, height)
            .webp({quality})
            .toBuffer();
    }

    static async removeFile(id: number, transaction?: Transaction): Promise<boolean> {
        const image = await Image.findByPk(id);

        if (image) {
            const strategy = FileStrategyHelper.getInstance();

            await strategy.delete(image.original_uri);
            await strategy.delete(image.large_uri);
            await strategy.delete(image.medium_uri);
            await strategy.delete(image.small_uri);
            await strategy.delete(image.thumbnail_uri);

            await image.destroy({transaction});
            return true;
        } else {
            return false;
        }
    }

}

export interface IImage {
    id?: number;
    original_uri?: string;
    large_uri?: string;
    medium_uri?: string;
    small_uri?: string;
    thumbnail_uri?: string;
    name?: string;
    mimetype?: string;
    size?: number;
}
