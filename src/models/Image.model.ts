import {BelongsToMany, Column, Model, Table} from "sequelize-typescript";
import {UploadedFile} from "express-fileupload";
import sharp from 'sharp';
import ProductVariantImg from "@models/ProductVariantImg.model";
import ProductVariant from "@models/ProductVariant.model";
import {getFileStrategy} from "@core/files/FileStrategy";
import {images} from 'config';
import {Transaction} from "sequelize";
import slugify from "slugify";
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
        const strategy = getFileStrategy();

        const {name: normalName, ext} = splitImageNameByExt(slugify(name, {lower: true}));


        const original_uri = await strategy.create(data, `${normalName}.${ext}`);
        const large_uri = await strategy.create(await Image.resizeImage(data, "large"), `${normalName}.large.${ext}`);
        const medium_uri = await strategy.create(await Image.resizeImage(data, "medium"), `${normalName}.medium.${ext}`);
        const small_uri = await strategy.create(await Image.resizeImage(data, "small"), `${normalName}.small.${ext}`);
        const thumbnail_uri = await strategy.create(await Image.resizeImage(data, "thumbnail"), `${normalName}.thumbnail.${ext}`);

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
            const strategy = getFileStrategy();

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
