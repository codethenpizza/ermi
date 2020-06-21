import {Action} from './../Action'
import {Request, Response} from 'express';

interface Body {
  data: any;
}

export class ProductCreateAction implements Action{
  handle(req: Request<{}, {}, Body>, res: Response): void {
    console.log('asd')
  }
}