import {IUser} from "@core/models/User.model";

export interface JWTPayload<UserType> {
    user: UserType
    iat?: number;
    exp?: number;
}

export interface LoginObj {
    user: Partial<IUser>,
    token: string;
    refreshToken: string;
}

export interface IRefreshTokensResp {
    refreshToken: string;
    token: string
}
