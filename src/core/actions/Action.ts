import {Request, Response} from 'express';

export abstract class Action {
  abstract handle(req: Request, res: Response): void
}
