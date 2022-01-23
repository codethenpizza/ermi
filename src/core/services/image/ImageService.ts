import {UploadedFile} from "express-fileupload";
import {Transaction} from "sequelize";
import slugify from "slugify";
import sharp from "sharp";

import Image, {IImage} from "@core/models/Image.model";
import {splitImageNameByExt} from "@core/helpers/utils";
import {IImageServiceConfig, IImageServiceSize} from "@core/services/image/types";
import {FilesService} from "@core/services/files/FilesService";

export class ImageService {

    constructor(
        private filesService: FilesService,
        private config: IImageServiceConfig,
    ) {
    }

    async uploadFile(
        {
            name,
            data,
            size,
            mimetype
        }: Partial<UploadedFile>, transaction?: Transaction): Promise<IImage> {

        const {name: normalName, ext} = splitImageNameByExt(slugify(name, {lower: true}));


        const [
            largeData,
            mediumData,
            smallData,
            thumbnailData
        ] = await Promise.all([
            this.resizeImage(data, "large"),
            this.resizeImage(data, "medium"),
            this.resizeImage(data, "small"),
            this.resizeImage(data, "thumbnail")
        ]);

        const [
            original_uri,
            large_uri,
            medium_uri,
            small_uri,
            thumbnail_uri
        ] = await Promise.all([
            this.filesService.create(data, `${normalName}.${ext}`),
            this.filesService.create(largeData, `${normalName}.large.${ext}`),
            this.filesService.create(mediumData, `${normalName}.medium.${ext}`),
            this.filesService.create(smallData, `${normalName}.small.${ext}`),
            this.filesService.create(thumbnailData, `${normalName}.thumbnail.${ext}`)
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
        }, {transaction, raw: true}) as unknown as Promise<IImage>;
    }

    resizeImage(data: Buffer, type: IImageServiceSize, quality = 75): Promise<Buffer> {
        const {width, height} = this.config.sizes[type];
        return sharp(data)
            .resize(width, height)
            .webp({quality})
            .toBuffer();
    }

    async removeImage(id: number, transaction?: Transaction): Promise<void> {
        const image = await Image.findByPk(id);

        if (!image) {
            throw new Error(`Can't find image with id = ${id}`);
        }

        await this.filesService.delete(image.original_uri);
        await this.filesService.delete(image.large_uri);
        await this.filesService.delete(image.medium_uri);
        await this.filesService.delete(image.small_uri);
        await this.filesService.delete(image.thumbnail_uri);

        await image.destroy({transaction});
    }

}
