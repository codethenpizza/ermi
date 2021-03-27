import {Action} from "@projTypes/action";
import {NextFunction, Response, Request} from "express";
import Image from "@models/Image.model";
import {UploadedFile} from "express-fileupload";


export class ImageUploadAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        if (req.files?.file) {
            const image = await Image.uploadFile(req.files.file as UploadedFile);
            res.send(image);
        } else {
            console.log(req);
            res.status(500).send({error: 'Field file is required'});
        }
    }

}
