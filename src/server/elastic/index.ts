import '@db';
import {EsProduct} from "./EsProducts";
import {RimAttrScheme} from "../../modules/suppliers/RimAttrScheme";

export const updateProductIndexes = async () => {

    EsProduct.addSchemes([
        RimAttrScheme
    ]);

    const es = new EsProduct();
    await es.updateData()

}
