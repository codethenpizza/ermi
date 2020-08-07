import {NextFunction, Request, Response} from "express";

import {Action} from "@projTypes/action";
import AttrSet from "@models/AttrSet.model";
import {ForeignKeyConstraintError, UniqueConstraintError} from "sequelize";

const catchError = (e, res: Response) => {
    if (e instanceof UniqueConstraintError) {
        res.status(400).send({error: 'Attribute set with such name is already exists'});
    } else if (e instanceof ForeignKeyConstraintError) {
        res.status(400).send({error: 'Unavailable attribute id'});
    } else {
        res.status(400).send({error: e});
    }
};

type ReqParams = {
    id: string;
};

type reqType = {
    name?: string;
    desc?: string;
    attributes?: number[];
};

class AttrSetCreateAction implements Action {
    get action() {
        return [this.assert, this.handle];
    }

    assert(req: Request<ReqParams, any, reqType, any>, res: Response, next: NextFunction) {
        if (isNaN(parseInt(req.params.id))) {
            res.status(400).send({error: 'id is required number query param'});
        } else {
            next();
        }
    }

    async handle(req: Request<ReqParams, any, reqType, any>, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const set = await AttrSet.updateWR({id, ...req.body});
            res.send(set);
        } catch (error) {
            catchError(error, res);
        }
    }

}

export default new AttrSetCreateAction();
