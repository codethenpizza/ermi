import {Router} from "express";
import UserCreateAction from "@actions/admin/User/UserCreateAction";

const UserController = Router();

UserController.get('/create', ...UserCreateAction.action);

export {UserController}
