import {ProductUseCases} from "@core/useCases/ProductUseCases/ProductUseCases";
import {Transaction} from "sequelize";
import {IProductVariant} from "@core/models/ProductVariant.model";
import {createMockProduct} from "./createMockProduct";
import {IProductVariantCreateData} from "@core/useCases/ProductUseCases/types";

export const createMockProductVariant = async (productUseCases: ProductUseCases, data?: IProductVariantCreateData, transaction?: Transaction): Promise<IProductVariant> => {
    const mockProduct = await createMockProduct(productUseCases, null, transaction);

    const mockData: IProductVariantCreateData = data || {
        images: [],
        attrs: [],
        is_available: true
    };
    return productUseCases.createVariant(mockData, mockProduct.id, transaction);
}
