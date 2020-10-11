import {Action} from "@projTypes/action";
import {NextFunction, Request, Response} from "express";
import {fetchAll, storeAll} from "../runner";
import {updateIndexes} from "@server/elastic";

export class UpdateSuppliersProductsAction implements Action {

    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<any, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<any, any, any, any>, res: Response) {
        await fetchAll();
        await storeAll();
        await updateIndexes();
        res.send();
    }

}
