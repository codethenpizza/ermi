import Address, {IAddress} from "@core/models/Address.model";
import {Transaction} from "sequelize";

export const createMockAddress = async (data?: IAddress, transaction?: Transaction): Promise<IAddress> => {
    const addressData: IAddress = data || {fields: 'Mock address'};
    return Address.create(addressData, {transaction})
        .then(x => x.toJSON() as IAddress);
}
