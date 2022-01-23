import {AuthService} from "@core/services/auth/AuthService";
import User, {IUser, IUserCreate} from "@core/models/User.model";
import {LoginObj} from "@core/services/auth/types";
import {Transaction} from "sequelize";
import {IUserUpdateData} from "@core/useCases/UserUseCases/types";

export class UserUseCases {

    constructor(
        private authService: AuthService
    ) {
    }

    register(data: IUserCreate, transaction?: Transaction): Promise<LoginObj> {
        return this.authService.register(data, transaction);
    }

    async update(data: IUserUpdateData, transaction?: Transaction): Promise<IUser> {
        const user = await User.findByPk(data.id, {transaction});

        if (!user) {
            throw new Error(`Can't find user with id = ${user.id}`)
        }

        return user.update(data, {transaction});
    }

    refreshPassword() {
        throw new Error('Need realization');
    }

}
