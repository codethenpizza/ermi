import '@db';
import {EsProduct} from "./EsProducts";
import {RimAttrScheme} from "../../modules/suppliers/schemas/RimAttrScheme";

EsProduct.addSchemes([
    RimAttrScheme
]);

export const esProduct = new EsProduct();

export const resetIndex = async () => {
    await esProduct.resetIndex();
}
