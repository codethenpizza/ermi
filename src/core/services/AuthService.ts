import jwt from 'jsonwebtoken';
import User, {IAdminUserJWTPayload, IUser, IUserJWTPayload} from "@models/User.model";
import config from 'config';
import argon2 from 'argon2';
import {Transaction} from "sequelize";
import B2BDiscountGroup from "@models/B2BDiscountGroup.model";
import RefreshToken, {IRefreshToken} from "@models/RefreshToken.model";
import * as crypto from "crypto";

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

export class AuthService {

    static async register({
                              password,
                              email,
                              name,
                              phone,
                              b2b_discount_group_id
                          }: Partial<IUser>, transaction?: Transaction): Promise<LoginObj> {
        const passwordHashed = await argon2.hash(password);

        const user = await User.create({
            password: passwordHashed,
            email,
            name,
            phone,
            b2b_discount_group_id
        }, {transaction, include: [B2BDiscountGroup]});
        const refreshToken = await AuthService.generateRefreshToken(user.id)
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                b2b_discount_group_id: user.b2b_discount_group_id
            },
            token: AuthService.generateToken(user as unknown as IUser),
            refreshToken
        }
    }

    static async login(email: string, password: string): Promise<LoginObj> {
        const user = await User.findOne({where: {email}, include: [B2BDiscountGroup]});
        const isCorrectPass = await user ? argon2.verify(user.password, password) : null

        if (!isCorrectPass) {
            throw new Error('Authentication error')
        }
        const refreshToken = await AuthService.generateRefreshToken(user.id)
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                b2b_discount_group_id: user.b2b_discount_group_id
            },
            token: AuthService.generateToken(user),
            refreshToken
        }
    }

    static async loginAdmin(email: string, password: string): Promise<LoginObj> {
        const user = await User.findOne({where: {email, is_admin: 1}});
        const isAuthenticated = await user ? argon2.verify(user.password, password) : null

        if (!isAuthenticated) {
            throw new Error('Authentication error');
        }
        const refreshToken = await AuthService.generateRefreshToken(user.id)
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token: AuthService.generateToken(user),
            refreshToken
        }
    }

    // access token
    private static generateToken(user: IUserJWTPayload | IAdminUserJWTPayload): string {

        const payload: JWTPayload<typeof user> = {
            user
        };

        const signature = config.auth.secretAccessToken;
        const expiration = config.auth.accessTokenLifetime;

        return jwt.sign(payload, signature, {expiresIn: expiration});
    }

    public static parseAuthHeader(headers): string | null {
        const authHeader = headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        return token || null
    }

    // refresh token
    public static async generateRefreshToken(userId: number) {
        try {
            const res = await RefreshToken.destroy({
                where: {
                    user_id: userId
                }
            })

            const token = crypto.randomBytes(20).toString('hex')
            const refreshToken: IRefreshToken = {
                token,
                user_id: userId,
                expiryDate: (new Date().getSeconds() + +config.auth.refreshTokenLifetime).toString(),
            }
            await RefreshToken.create(refreshToken)

            return token
        } catch (e) {
            console.error(e)
        }
    }

    // refresh access and refresh tokens
    public static async refreshTokens(refreshToken: string): Promise<IRefreshTokensResp> {
        const token = await RefreshToken.findOne({
            where: {
                token: refreshToken
            },
            include: [User]
        })
        if (!token || new Date(token.expiryDate) < new Date()) {
            // user should login again
            throw new Error('Please login again')
        }
        await RefreshToken.destroy({
            where: {
                id: token.id
            }
        })

        const newAccessToken = AuthService.generateToken(token.user);
        const newRefreshToken = await AuthService.generateRefreshToken(token.user.id);
        return {
            token: newAccessToken,
            refreshToken: newRefreshToken
        }
    }
}
