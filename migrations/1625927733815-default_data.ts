import {Op, Transaction} from "sequelize";
import AttrType from "../src/models/AttrType.model";
import ProductCategory, {IProductCategory} from "../src/models/ProductCategory.model";

const DefaultAttrTypes = [
    'string',
    'number',
    'decimal',
    'json',
    'array'
];

const RootProductCategoryName = 'Default';

export const up = async (transaction: Transaction) => {
    // Set default attr types
    for (let type of DefaultAttrTypes) {
        await AttrType.create({type}, {transaction});
    }

    // Set default product category
    const cat: IProductCategory = {
        name: RootProductCategoryName
    };

    await ProductCategory.create(cat, {transaction});
};

export const down = async (transaction: Transaction) => {
    // Remove default product category
    await ProductCategory.destroy({where: {name: RootProductCategoryName}, transaction})

    // Remove default attr types
    await AttrType.destroy({where: {type: {[Op.in]: DefaultAttrTypes}}, transaction});
};
