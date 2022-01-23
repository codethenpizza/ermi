import {ImageToEntity} from "@core/models/types";
import {IAttrValue} from "@core/models/AttrValue.model";

export const imageRelationsDiff =
    <T1 extends ImageToEntity, T2 extends ImageToEntity>(newImages: T1[] | undefined, oldImages: T2[]): {
        imageIdsToCreate: T1[];
        imageIdsToDestroy: T2[];
    } => {
        if (newImages === undefined) {
            return {
                imageIdsToCreate: [],
                imageIdsToDestroy: []
            }
        }

        newImages.forEach((img, i) => {
            const index = oldImages.findIndex(x => x.image_id === img.image_id && x.position === img.position);
            if (index !== -1) {
                newImages.splice(i, 1);
                oldImages.splice(index, 1);
            }
        });

        return {
            imageIdsToCreate: newImages,
            imageIdsToDestroy: oldImages
        };
    }


export const catRelationsDiff = (newCatIds: number[] | undefined, oldCats: number[]): {
    catIdsToCreate: number[];
    catIdsToDestroy: number[];
} => {
    if (newCatIds === undefined) {
        return {
            catIdsToCreate: [],
            catIdsToDestroy: []
        };
    }

    newCatIds.forEach((id, i) => {
        const index = oldCats.findIndex(x => x === id);
        if (index !== -1) {
            newCatIds.splice(i, 1);
            oldCats.splice(index, 1);
        }
    });

    return {
        catIdsToCreate: newCatIds,
        catIdsToDestroy: oldCats
    }
}

export const attrValueDiff = (
    newAttrValues: Pick<IAttrValue, 'attr_id' | 'value'>[] | undefined,
    oldAttrValues: IAttrValue[] = []
): {
    attrValuesToCreate: Pick<IAttrValue, 'attr_id' | 'value'>[];
    attrValueIdsToDestroy: number[];
} => {

    if (newAttrValues === undefined) {
        return {
            attrValuesToCreate: [],
            attrValueIdsToDestroy: []
        }
    }

    newAttrValues.forEach((attrValue, i) => {
        const index = oldAttrValues.findIndex(x => x.value === attrValue.value && x.attr_id === attrValue.attr_id);
        if (index !== -1) {
            newAttrValues.splice(i, 1);
            oldAttrValues.splice(index, 1);
        }
    });

    return {
        attrValuesToCreate: newAttrValues,
        attrValueIdsToDestroy: oldAttrValues.map(x => x.id)
    }
}
