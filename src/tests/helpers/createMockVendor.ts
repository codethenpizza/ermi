import {Transaction} from "sequelize";
import Vendor, {IVendor, IVendorCreate} from "@core/models/Vendor.model";
import {getRandomNumber} from "./utils";

export const createMockVendor = async (data?: IVendorCreate, transaction?: Transaction): Promise<IVendor> => {
    const mockData: IVendorCreate = data || {
        name: `Test vendor #${getRandomNumber()}`
    };
    return Vendor.create(mockData, {transaction})
        .then(x => x.toJSON() as IVendor);
}
