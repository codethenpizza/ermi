import {ImageService} from "@core/services/image/ImageService";
import {UploadedFile} from "express-fileupload";
import Image, {IImage} from "@core/models/Image.model";
import {getFileNameFromUrl, getImageFromUrl, isDev, isTest} from "@core/helpers/utils";

export class ImageUseCases {

    constructor(
        private imageService: ImageService
    ) {
    }

    create(file: Partial<UploadedFile>): Promise<IImage> {
        return this.imageService.uploadFile(file);
    }

    delete(id: number): Promise<void> {
        return this.imageService.removeImage(id);
    }

    findImageByName(name: string): Promise<IImage> {
        return Image.findOne({where: {name}, raw: true}) as unknown as Promise<IImage>;
    }

    async createImageByUrl(url: string): Promise<IImage> {
        if (isDev || isTest) {
            return Image.create({original_uri: url}, {raw: true});
        } else {
            const data = await getImageFromUrl(url);
            const name = getFileNameFromUrl(url);

            return this.create({name, data});
        }
    }

}
