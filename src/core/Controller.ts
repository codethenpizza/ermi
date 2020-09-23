import {Action} from "@projTypes/action";
import {Router} from "express";

export interface Type<T> extends Function {
    new(...args: any[]): T;
}

export interface Route {
    method: 'get' | 'post' | 'put' | 'delete' | 'all' | 'use';
    path: string;
    action: Type<Action> | Router;
}

export const createController = (routes: Route[]): Router => {
    const router = Router();

    routes.forEach((route) => {
        if (route.method === 'use') {
            const controller = route.action as Router;
            router.use(route.path, controller);
        } else {
            const action = route.action as Type<Action>;
            const actionClass = new action();
            router[route.method](route.path, ...actionClass.action);
        }
    });

    return router;
};
