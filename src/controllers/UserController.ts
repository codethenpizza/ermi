import {Router} from "express";
import UserCreateAction from "@actions/User/UserCreateAction";

export const UserController = (): Router => {
    const router = Router();

    router.get('/create', ...UserCreateAction.action);

    return router;
};
