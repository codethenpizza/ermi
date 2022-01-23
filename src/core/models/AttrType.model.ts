import {Column, HasMany, Model, Table} from "sequelize-typescript";
import Attribute, {IAttribute} from "@core/models/Attribute.model";

@Table({
    tableName: 'attr_type',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class AttrType extends Model<AttrType> implements IAttrType {
    @Column({
        allowNull: false
    })
    name: ATTR_TYPE;

    @HasMany(() => Attribute)
    attributes: IAttribute[];
}

export interface IAttrType {
    id?: number;
    name: ATTR_TYPE;
    attributes?: IAttribute[];
}

export enum ATTR_TYPE {
    DECIMAL = 'decimal',
    NUMBER = 'number',
    ARRAY = 'array',
    JSON = 'json',
    BOOLEAN = 'boolean'
}
