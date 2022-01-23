import Attribute, {IAttribute, IAttributeCreate} from "@core/models/Attribute.model";
import {ATTR_TYPE_ID} from "../constants";
import {getRandomNumber} from "./utils";
import {Transaction} from "sequelize";

export const createMockAttr = async (transaction?: Transaction): Promise<IAttribute> => {
    const attrData: IAttributeCreate = {
        name: `testAttr${getRandomNumber()}`,
        type_id: ATTR_TYPE_ID.STRING
    };
    return Attribute.create(attrData, {transaction}).then(x => x.toJSON() as IAttribute);
}
