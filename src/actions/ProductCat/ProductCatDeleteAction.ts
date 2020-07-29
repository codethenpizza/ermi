import {Action} from "@projTypes/action";
import {NextFunction, Response, Request} from "express";
import ProductCategory from "@models/Category.model";

type reqParams = {
    id: string;
};

class ProductCatDeleteAction extends Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<reqParams, any, any, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number param'});
        } else {
            next();
        }
    }

    async handle(req: Request<reqParams, any, any, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const model = await ProductCategory.destroy({where: {id}});
            if (!!model) {
                res.status(204).send();
            } else {
                res.status(400).send({error: `category with id=${id} not found`});
            }
        } catch (error) {
            res.status(400).send({error});
        }

    }

}

export default new ProductCatDeleteAction();
