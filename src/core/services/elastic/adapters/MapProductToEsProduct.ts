import {IProduct} from "@core/models/Product.model";
import {Elastic} from "@core/services/elastic/types";

export const mapProductToEsProduct = (product: IProduct): Elastic.Product => ({
    id: product.id,
    name: product.name,
    desc: product.desc,
    attr_set_id: product.attr_set_id
});
