import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import Image from "@models/Image.model";
import {isAuth} from "../../../middlewares/auth";

type QueryParams = {
    limit: string;
    offset: string;
};

export class ImageListAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle({query: {offset = '0', limit = '20'}}: Request<any, any, any, QueryParams>, res: Response) {
        try {
            const images = await Image.findAndCountAll({
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['id', 'DESC']]
            });
            res.send(images);
        } catch (error) {
            res.status(400).send({error});
        }
    }

}
