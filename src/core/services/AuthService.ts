import jwt from 'jsonwebtoken';
import User, {UserI} from "@models/User.model";
import config from 'config';
import argon2 from 'argon2';

export interface JWTPayload {
    user: {
        id: number;
        email: string;
        name: string;
    }
}

export interface LoginObj {
    user: Partial<UserI>,
    token: string;
}

export class AuthService {

    static async register({password, email, name}: Partial<UserI>): Promise<LoginObj> {
        const passwordHashed = await argon2.hash(password);

        const user = await User.create({
            password: passwordHashed,
            email,
            name,
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token: AuthService.generateToken(user)
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
            token: AuthService.generateToken(user)
        }
    }

    private static generateToken(user: UserI): string {

        const payload: JWTPayload = {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        };

        const signature = config.auth.secret;
        const expiration = '6h';

        return jwt.sign(payload, signature, { expiresIn: expiration });
    }

}
