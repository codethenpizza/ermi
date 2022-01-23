import {addAttributeOptions} from "sequelize-typescript";

export function ToNumber(target: any, propertyKey: string): any {
    addAttributeOptions(target, propertyKey, {
        get(): any {
            // @ts-ignore
            return +this.getDataValue(propertyKey);
        }
    });
}
