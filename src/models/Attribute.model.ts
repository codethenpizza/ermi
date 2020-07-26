import {BelongsTo, BelongsToMany, Column, ForeignKey, Model, Table, Unique} from "sequelize-typescript";
import AttrType from "@models/AttrType.model";
import AttrSet from "@models/AttrSet.model";
import AttrSetAttr from "@models/AttrSetAttr.model";

@Table({
    tableName: 'attribute',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Attribute extends Model<Attribute> {
    @Unique
    @Column
    name: string;

    @ForeignKey(() => AttrType)
    @Column
    type_id: number;

    @BelongsTo(() => AttrType)
    type: AttrType;

    @BelongsToMany(() => AttrSet, () => AttrSetAttr)
    attrSets: AttrSet[];
}

export type AttributeI = {
    name: string;
    type_id: number;
};
