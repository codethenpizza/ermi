import {Action} from "@actions/Action";
import {NextFunction, Request, Response} from "express";


export class ImageUploadAction extends Action {

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        // if (req.files?.file) {
        //     const image = await Image.uploadFile(req.files.file as UploadedFile);
        //     res.send(image);
        // } else {
        //     console.log(req);
        //     res.status(500).send({error: 'Field file is required'});
        // }
    }

}
