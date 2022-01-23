import jwt from 'jsonwebtoken';
import User, {IAdminUserJWTPayload, IUser, IUserCreate, IUserJWTPayload} from "@core/models/User.model";
import config from 'config';
import argon2 from 'argon2';
import {Transaction} from "sequelize";
import B2BDiscountGroup from "@core/models/B2BDiscountGroup.model";
import RefreshToken, {IRefreshToken} from "@core/models/RefreshToken.model";
import * as crypto from "crypto";
import {IRefreshTokensResp, JWTPayload, LoginObj} from "@core/services/auth/types";

export class AuthService {

    static parseAuthHeader(headers): string | null {
        const authHeader = headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        return token || null
    }

    async register(data: IUserCreate, transaction?: Transaction): Promise<LoginObj> {
        const user = await this.create(data, transaction);

        return this.makeLoginResp(user, transaction);
    }

    async create(data: IUserCreate, transaction?: Transaction): Promise<IUser> {
        const passwordHashed = await argon2.hash(data.password);

        const userData: IUserCreate = {
            ...data,
            password: passwordHashed,
        };

        return User.create(userData, {transaction, include: [B2BDiscountGroup]})
            .then(x => x.toJSON() as IUser);
    }

    async login(email: string, password: string, transaction?: Transaction): Promise<LoginObj> {
        const user = await User.findOne({where: {email}, include: [B2BDiscountGroup], transaction});
        const isCorrectPass = user ? await argon2.verify(user.password, password) : false;

        if (!isCorrectPass) {
            throw new Error('Authentication error')
        }

        return this.makeLoginResp(user, transaction);
    }

    async loginAdmin(email: string, password: string, transaction?: Transaction): Promise<LoginObj> {
        const user = await User.findOne({where: {email, is_admin: 1}, transaction});
        const isAuthenticated = user ? await argon2.verify(user.password, password) : false;

        if (!isAuthenticated) {
            throw new Error('Authentication error');
        }

        return this.makeLoginResp(user, transaction);
    }

    public async generateRefreshToken(userId: number, transaction?: Transaction): Promise<string> {
        await RefreshToken.destroy({
            where: {
                user_id: userId
            },
            transaction
        })

        const token = crypto.randomBytes(20).toString('hex');

        const refreshToken: IRefreshToken = {
            token,
            user_id: userId,
            expiryDate: (new Date().getSeconds() + +config.auth.refreshTokenLifetime).toString(),
        };
        await RefreshToken.create(refreshToken, {transaction});

        return token;
    }

    // refresh access and refresh tokens
    public async refreshTokens(refreshToken: string): Promise<IRefreshTokensResp> {
        const token = await RefreshToken.findOne({
            where: {
                token: refreshToken
            },
            include: [User]
        });

        if (!token || new Date(token.expiryDate) < new Date()) {
            // user should login again
            throw new Error('Please login again');
        }

        await RefreshToken.destroy({
            where: {
                id: token.id
            }
        })

        const newAccessToken = this.generateAccessToken(token.user);
        return {
            token: newAccessToken,
            refreshToken: refreshToken
        }
    }

    private async makeLoginResp(user: IUser, transaction?: Transaction): Promise<LoginObj> {
        const refreshToken = await this.generateRefreshToken(user.id, transaction);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                b2b_discount_group_id: user.b2b_discount_group_id
            },
            token: this.generateAccessToken(user),
            refreshToken
        }
    }

    private generateAccessToken(user: IUserJWTPayload | IAdminUserJWTPayload): string {

        const payload: JWTPayload<typeof user> = {
            user
        };

        const {secret, accessTokenLifetime} = config.auth;

        return jwt.sign(payload, secret, {expiresIn: accessTokenLifetime});
    }
}
