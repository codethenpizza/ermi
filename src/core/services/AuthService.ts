import jwt from 'jsonwebtoken';
import User, {IUser} from "@models/User.model";
import config from 'config';
import argon2 from 'argon2';
import {Transaction} from "sequelize";

export interface JWTPayload {
    user: {
        id: number;
        email: string;
        name: string;
        phone: string;
    },
    iat?: number;
    exp?: number;
}

export interface LoginObj {
    user: Partial<IUser>,
    token: string;
}

export class AuthService {

    static async register({password, email, name, phone}: Partial<IUser>, transaction?: Transaction): Promise<LoginObj> {
        const passwordHashed = await argon2.hash(password);

        const user = await User.create({
            password: passwordHashed,
            email,
            name,
            phone,
        }, {transaction});

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            },
            token: AuthService.generateToken(user as unknown as IUser)
        }
    }

    static async login(email: string, password: string): Promise<LoginObj> {
        const user = await User.findOne({where: {email}});

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
                email: user.email
            },
            token: AuthService.generateToken(user as unknown as IUser)
        }
    }

    private static generateToken(user: IUser): string {

        const payload: JWTPayload = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        };

        const signature = config.auth.secret;
        const expiration = '6h';

        return jwt.sign(payload, signature, { expiresIn: expiration });
    }

}
