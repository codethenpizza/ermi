import {Action} from "@actions/Action";
import {Router} from "express";
import {RequestHandler} from "express-serve-static-core";

export interface Type<T> extends Function {
    new(...args: any[]): T;
}

export interface Route {
    method: 'get' | 'post' | 'put' | 'delete' | 'all' | 'use';
    path: string;
    middlewares?: RequestHandler[];
    action: Type<Action> | Router;
}

export const createController = (routes: Route[]): Router => {
    const router = Router();

    routes.forEach((route) => {
        if (route.method === 'use') {
            const controller = route.action as Router;
            router.use(route.path, ...(route.middlewares || []), controller);
        } else {
            const action = route.action as Type<Action>;
            const actionClass = new action();
            router[route.method](route.path, ...(route.middlewares || []), ...actionClass.action);
        }
    });

    return router;
};
