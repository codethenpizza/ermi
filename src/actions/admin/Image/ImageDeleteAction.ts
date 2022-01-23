import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";

export class ImageDeleteAction extends Action {

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        if (!req.params.id) {
            res.status(400).send({error: 'id is required param'});
        }

        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        // const {id} = req.params;
        // const result = await Image.removeFile(id);
        //
        // if (!result) {
        //     res.status(400).send({status: 'fail'});
        // } else {
        //     res.send({status: 'success'});
        // }
    }

}
