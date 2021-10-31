import jwt from 'jsonwebtoken';
import User, {IAdminUserJWTPayload, IUser, IUserJWTPayload} from "@models/User.model";
import config from 'config';
import argon2 from 'argon2';
import {Transaction} from "sequelize";
import B2BDiscountGroup from "@models/B2BDiscountGroup.model";

export interface JWTPayload<UserType> {
    user: UserType
    iat?: number;
    exp?: number;
}

export interface LoginObj {
    user: Partial<IUser>,
    token: string;
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

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                b2b_discount_group_id: user.b2b_discount_group_id
            },
            token: AuthService.generateToken(user as unknown as IUser)
        }
    }

    static async login(email: string, password: string): Promise<LoginObj> {
        const user = await User.findOne({where: {email}, include: [B2BDiscountGroup]});

        if (!user) {
            throw new Error('User not found');
        }

        const isCorrectPass = await argon2.verify(user.password, password)

        if (!isCorrectPass) {
            throw new Error('Incorrect password')
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                b2b_discount_group_id: user.b2b_discount_group_id
            },
            token: AuthService.generateToken(user)
        }
    }

    static async loginAdmin(email: string, password: string): Promise<LoginObj> {
        console.log(email)
        const user = await User.findOne({where: {email, is_admin: 1}});
        const isAuthenticated = await user ? argon2.verify(user.password, password) : null

        if (!isAuthenticated) {
            throw new Error('User not found');
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token: AuthService.generateToken(user)
        }
    }

    private static generateToken(user: IUserJWTPayload | IAdminUserJWTPayload): string {

        const payload: JWTPayload<typeof user> = {
            user
        };

        const signature = config.auth.secretAccessToken;
        const expiration = '6h';

        return jwt.sign(payload, signature, {expiresIn: expiration});
    }

    public static parseAuthHeader(headers): string | null {
        const authHeader = headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        return token || null
    }
}
