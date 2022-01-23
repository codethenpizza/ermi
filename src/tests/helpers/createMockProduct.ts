import {Transaction} from "sequelize";
import {IProduct} from "@core/models/Product.model";
import {ProductUseCases} from "@core/useCases/ProductUseCases/ProductUseCases";
import {IProductCreateData} from "@core/useCases/ProductUseCases/types";
import {ROOT_CAT_ID} from "../constants";
import {getRandomNumber} from "./utils";

export const createMockProduct = (productUseCases: ProductUseCases, data?: IProductCreateData, transaction?: Transaction): Promise<IProduct> => {
    const mockData: IProductCreateData = data || {
        cat_ids: [ROOT_CAT_ID],
        name: `Mock product #${getRandomNumber()}`
    };
    return productUseCases.createProduct(mockData, transaction);
}
