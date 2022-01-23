import {IImage} from "@core/models/Image.model";
import {Elastic} from "@core/services/elastic/types";
import {ImageToEntity} from "@core/models/types";

export const mapImagesToEsImages = (imgs: IImage[], imgMaps: ImageToEntity[]): Elastic.Image[] => {

    const imageToEntityMap = new Map<number, ImageToEntity>();
    imgMaps.forEach(x => imageToEntityMap.set(x.image_id, x));

    return imgs.map(img => {
        if (!imageToEntityMap.has(img.id)) {
            throw new Error(`
                MapImagesToEsImages adapter ERROR: field "img.id" must be equal to field "imgMaps.image_id".
                Image - ${JSON.stringify(img, null, 2)}
                ImgMap - ${JSON.stringify(imgMaps, null, 2)}
            `);
        }

        return {
            id: img.id,
            name: img.name,
            original_uri: img.original_uri,
            large_uri: img.large_uri,
            medium_uri: img.medium_uri,
            thumbnail_uri: img.thumbnail_uri,
            small_uri: img.small_uri,
            mimetype: img.mimetype,
            size: img.size,
            position: imageToEntityMap.get(img.id).position,
        }
    });
}
