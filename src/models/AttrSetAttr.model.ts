import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import AttrSet from "@models/AttrSet.model";
import Attribute from "@models/Attribute.model";

@Table({
    tableName: 'attr_set_attr',
    timestamps: false
})
export default class AttrSetAttr extends Model<AttrSetAttr> {

    @ForeignKey(() => AttrSet)
    @Column
    attr_set_id: number;

    @ForeignKey(() => Attribute)
    @Column
    attr_id: number;

}

export interface IAttrSetAttr {
    attr_set_id: number;
    attr_id: number;
}
