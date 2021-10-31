import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import Image from "@models/Image.model";
import {isAuth} from "../../../middlewares/auth";

export class ImageDeleteAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        if (!req.params.id) {
            res.status(400).send({error: 'id is required param'});
        }

        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        const {id} = req.params;
        const result = await Image.removeFile(id);

        if (!result) {
            res.status(400).send({status: 'fail'});
        } else {
            res.send({status: 'success'});
        }
    }

}
