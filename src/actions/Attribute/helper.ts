import {Response} from "express";
import {ForeignKeyConstraintError, UniqueConstraintError} from "sequelize";

export const catchError = (e, res: Response) => {
    if (e instanceof UniqueConstraintError) {
        res.status(400).send({error: 'Attribute with such name is already exists'});
    } else if (e instanceof ForeignKeyConstraintError) {
        res.status(400).send({error: 'Unavailable attribute type'});
    } else {
        res.status(400).send({error: e});
    }
};
