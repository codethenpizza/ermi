import {Elastic} from "@core/services/elastic/types";
import parseDouble from "@core/helpers/parseDouble";
import {IAttrValue} from "@core/models/AttrValue.model";

export const mapAttrValueToEsAttribute = (attrValue: IAttrValue): Elastic.Attribute => {
    let value: string | boolean | number = attrValue.value;

    if (!attrValue?.attribute?.type?.name) {
        throw new Error(
            `MapAttrValueToEsAttribute adapter ERROR: field "attrValue.attribute.type.name" in AttributeValue is required.
             AttributeValue - ${JSON.stringify(attrValue, null, 2)}
            `
        );
    }

    switch (attrValue.attribute.type.name) {
        case 'decimal':
            value = parseDouble(value);
            break;

        case 'number':
            value = parseInt(value);
            break;

        case 'array':
        case 'json':
            value = JSON.parse(value);
            break;
        case 'boolean':
            value = value === '1'
            break;

    }

    return {
        value,
        type: attrValue.attribute.type.name,
        name: attrValue.attribute.name,
        slug: attrValue.attribute.slug
    };
};
