// @ts-ignore
const {Op} = require("sequelize");
const AttrType = require("@core/models/AttrType.model").default;
const ProductCategory = require("@core/models/ProductCategory.model").default;

const DefaultAttrTypes = [
    'string',
    'number',
    'decimal',
    'json',
    'array',
    'boolean'
];

const RootProductCategoryName = 'Default';

module.exports.up = async (transaction) => {
    // Set default attr types
    for (let name of DefaultAttrTypes) {
        await AttrType.create({name}, {transaction});
    }

    // Set default product category
    const cat = {
        name: RootProductCategoryName
    };

    await ProductCategory.create(cat, {transaction});
};

module.exports.down = async (transaction) => {
    // Remove default product category
    await ProductCategory.destroy({where: {name: RootProductCategoryName}, transaction})

    // Remove default attr types
    await AttrType.destroy({where: {name: {[Op.in]: DefaultAttrTypes}}, transaction});
};
