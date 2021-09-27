import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table, Unique} from "sequelize-typescript";
import AttrType from "@models/AttrType.model";
import AttrSet from "@models/AttrSet.model";
import AttrSetAttr from "@models/AttrSetAttr.model";
import slugify from "slugify";
import {Op} from "sequelize";

@Table({
    tableName: 'attribute',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Attribute extends Model<Attribute> {
    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING,
        field: 'name'
    })
    set name(val: string) {
        this.setDataValue('slug', slugify(val, {lower: true}));
        this.setDataValue('name', val);
    }
    get name() {
        return this.getDataValue('name');
    }

    @Column({
        unique: true
    })
    slug: string;

    @Column({
        defaultValue: false
    })
    aggregatable: boolean;

    @Column
    aggPath: string;

    @ForeignKey(() => AttrType)
    @Column({
        allowNull: false
    })
    type_id: number;

    @BelongsTo(() => AttrType)
    type: AttrType;

    @BelongsToMany(() => AttrSet, () => AttrSetAttr)
    attrSets: AttrSet[];

    static async findAggregatable() {
        return Attribute.findAll({where: {aggregatable: {[Op.not]: null}}, include: [AttrType]});
    }
}

export type IAttribute = {
    name: string;
    type_id: number;
    aggregatable?: boolean;
    aggPath?: string;
};

export enum ATTR_TYPE {
    STRING = 1,
    NUMBER,
    DECIMAL,
    JSON,
    ARRAY
}
