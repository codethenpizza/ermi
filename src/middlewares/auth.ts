import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from "express";
import {AuthService, JWTPayload} from "@core/services/AuthService";
import config from 'config';
import {IAdminUserJWTPayload, IUserJWTPayload} from "@models/User.model";

export const isAuth = (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    try {
        const token = AuthService.parseAuthHeader(req.headers)
        if (token == null) return res.sendStatus(401)

        jwt.verify(token, config.auth.secretAccessToken, (err, user) => {
            if (err) {
                console.log(err)
                return res.sendStatus(403)
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
        if (token == null) return res.sendStatus(401)
        const decoded = jwt.decode(token) as JWTPayload<IUserJWTPayload | IAdminUserJWTPayload>
        if (decoded?.user) {
            req.user = decoded.user
        }
        return next()
    } catch (e) {
        console.log('ERR', (e as Error).message);
        res.status(401).send((e as Error).message);
    }
};
