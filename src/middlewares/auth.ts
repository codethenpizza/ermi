import jwt from "express-jwt";
import config from 'config';
import {NextFunction, Request, Response} from "express";

export const isAuth = (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    try {
        jwt({
            algorithms: ['HS256'],
            secret: config.auth.secret,
            credentialsRequired: true
        })(req, res, next);
    } catch (e) {
        res.status(401).send((e as Error).message);
    }
};
