import '@db';
import {EsProduct} from "./EsProducts";
import {RimAttrScheme} from "../../modules/suppliers/schemas/RimAttrScheme";

export const esProduct = new EsProduct();

export const resetIndex = async () => {
    EsProduct.addSchemes([
        RimAttrScheme
    ]);
    await esProduct.resetIndex();
}

export const syncEsData = async () => {
    await esProduct.updateData();
}
