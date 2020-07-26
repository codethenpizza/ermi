import * as process from "process";

import {sequelize} from "../src/database";
import AttrType from "../src/models/AttrType.model";

(async () => {
    await sequelize.sync({force: true});

    await SetDefaultAttrTypes();

    process.exit(0);
})();

const SetDefaultAttrTypes = async () => {
    const types = [
        'string',
        'number',
        'decimal'
    ];

    for (let type of types) {
        await AttrType.create({type});
    }
};
