import '@db';
import {EsIndex} from "./EsIndex";
import {EsProduct} from "./EsProducts";
import AttrSet from "@models/AttrSet.model";

export const updateProductIndexes = async () => {

    const items: EsIndex[] = [];

    const attrSets = await AttrSet.findAll();
    for (let set of attrSets) {
        items.push(new EsProduct(set.slug));
    }

    for (const item of items) {
        await item.updateData();
    }

}
