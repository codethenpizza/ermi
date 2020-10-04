import '@db';
import {EsIndex} from "./EsIndex";
import {EsProduct} from "./EsProducts";

export async function updateIndexes() {

    const items: EsIndex[] = [
        new EsProduct()
    ];

    for (const item of items) {
        await item.start();
    }

}
