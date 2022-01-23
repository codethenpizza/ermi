import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";
import Image from "@core/models/Image.model";

type QueryParams = {
    limit: string;
    offset: string;
};

export class ImageListAction extends Action {

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
