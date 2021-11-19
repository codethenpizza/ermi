import {NextFunction, Request, Response} from "express";

import {Action} from "@projTypes/action";
import AttrSet from "@models/AttrSet.model";
import {ForeignKeyConstraintError, UniqueConstraintError} from "sequelize";
import {isAuth} from "../../../middlewares/auth";

const catchError = (e, res: Response) => {
    if (e instanceof UniqueConstraintError) {
        res.status(400).send({error: 'Attribute set with such name is already exists'});
    } else if (e instanceof ForeignKeyConstraintError) {
        res.status(400).send({error: 'Unavailable attribute id'});
    } else {
        res.status(400).send({error: e});
    }
};

type reqType = {
    name: string;
    desc: string;
    attributes: number[];
};

export class AttrSetCreateAction implements Action {
    get action() {
        return [isAuth, this.assert, this.handle];
    }

    assert(req: Request<any, any, reqType, any>, res: Response, next: NextFunction) {
        const {attributes, name} = req.body;
        if(Array.isArray(attributes) && attributes?.length && name) {
            next();
        } else {
            res.status(400).send({error: 'name and attributes array are required'});
        }
    }

    async handle(req: Request<any, any, reqType, any>, res: Response) {
        try {
            const set = await AttrSet.createWR(req.body);
            res.send(set);
        } catch (error) {
            catchError(error, res);
        }
    }

}
