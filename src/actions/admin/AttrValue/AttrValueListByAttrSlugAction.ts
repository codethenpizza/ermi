import {NextFunction, Request, Response} from "express";
import {Action} from "@actions/Action";
import Attribute from "@core/models/Attribute.model";
import AttrValue from "@core/models/AttrValue.model";

type ReqParams = {
    slug: string;
};

export class AttrValueListByAttrSlugAction extends Action {


    assert(req: Request<ReqParams, any, any, any>, res: Response, next: NextFunction) {
        next();
    }

    async handle(req: Request<ReqParams, any, any, any>, res: Response) {
        const slug = req.params.slug;

        const attr = await Attribute.findOne({where: {slug}});

        if (attr) {
            const values = await AttrValue.findAll({
                attributes: ['value'],
                group: ['value'],
                where: {attr_id: attr.id},
            }).then(x => x.map(({value}) => value));

            res.send(values);
        } else {
            res.status(400).send('No such attrs');
        }
    }
}
