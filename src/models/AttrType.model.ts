import {Column, HasMany, Model, Table} from "sequelize-typescript";
import Attribute from "@models/Attribute.model";

@Table({
    tableName: 'attr_type',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class AttrType extends Model<AttrType> {
    @Column
    type: string;

    @HasMany(() => Attribute)
    attributes: Attribute[];
}
