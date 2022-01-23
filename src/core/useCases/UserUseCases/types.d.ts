import {IUserCreate} from "@core/models/User.model";

export interface IUserUpdateData extends IUserCreate {
    id: number;
}
