import {IUser, IUserCreate} from "@core/models/User.model";
import {AuthService} from "@core/services/auth/AuthService";
import {Transaction} from "sequelize";
import {getRandomNumber} from "./utils";

export const createMockUser = async (authService: AuthService, data?: IUserCreate, transaction?: Transaction): Promise<IUser> => {
    const userData: IUserCreate = data || generateMockUserData();
    return authService.create(userData, transaction);
}

export const generateMockUserData = (): IUserCreate => {
    const randNum = getRandomNumber().toString();

    return {
        email: `test${randNum}@test.com`,
        password: randNum,
        name: `Test user #${randNum}`,
        phone: randNum,
    }
};
