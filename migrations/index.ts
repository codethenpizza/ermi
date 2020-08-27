import * as process from "process";

import {sequelize} from "../src/database";
import AttrType from "../src/models/AttrType.model";
import Attribute, {AttributeI} from "../src/models/Attribute.model";
import ProductCategory, {IProductCategory} from "../src/models/ProductCategory.model";

(async () => {
    await sequelize.sync({force: true});

    await SetDefaultAttrTypes();

    await SetDefaultAttributes();

    await SetDefaultProductCategories();

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

const SetDefaultAttributes = async () => {
    const attrs: AttributeI[] = [
        {name: 'price', type_id: 3},
        {name: 'sub-title', type_id: 1}
    ];

    for (let attr of attrs) {
        await Attribute.create(attr);
    }
};

const SetDefaultProductCategories = async () => {
    const cat: IProductCategory = {
        name: 'Default'
    };

    await ProductCategory.create(cat);
};

