import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from "express";
import {AuthService} from "@core/services/auth/AuthService";
import config from 'config';
import {IAdminUserJWTPayload, IUserJWTPayload} from "@core/models/User.model";
import {RequestHandler} from "express-serve-static-core";
import {JWTPayload} from "@core/services/auth/types";

export const isAuth: RequestHandler = (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    try {
        const token = AuthService.parseAuthHeader(req.headers)
        if (token == null) return res.sendStatus(401);

        jwt.verify(token, config.auth.secretAccessToken, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).send({message: "Unauthorized! Access Token was expired!"});
                }
                return res.sendStatus(401)
            }
            req.user = user
            next()
        })

    } catch (e) {
        res.sendStatus(403)
    }
}

export const setUser = (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    try {
        const token = AuthService.parseAuthHeader(req.headers)
        if (token === null) {
            return next();
        }
        const decoded = jwt.decode(token) as JWTPayload<IUserJWTPayload | IAdminUserJWTPayload>
        if (decoded?.user) {
            req.user = decoded.user
        }
        return next();
    } catch (e) {
        console.log('ERR', (e as Error).message);
        res.status(401).send((e as Error).message);
    }
};
