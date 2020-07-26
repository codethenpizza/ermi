import {BelongsToMany, Column, DataType, Model, Table} from "sequelize-typescript";
import Attribute from "@models/Attribute.model";
import AttrSetAttr from "@models/AttrSetAttr.model";

@Table({
    tableName: 'attribute_set',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class AttrSet extends Model<AttrSet> {

    @Column
    name: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @BelongsToMany(() => Attribute, () => AttrSetAttr)
    attributes: Attribute[];
}
