import {NextFunction, Request, Response} from 'express';

export abstract class Action {
    abstract handle(req: Request<any, any, any, any>, res: Response)

    abstract assert(req: Request<any, any, any, any>, res: Response, next: NextFunction)

    get action() {
        return [this.assert.bind(this), this.handle.bind(this)];
    }
}
