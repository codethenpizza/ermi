import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table, Unique} from "sequelize-typescript";
import AttrType, {IAttrType} from "@core/models/AttrType.model";
import AttrSet, {IAttrSet} from "@core/models/AttrSet.model";
import AttrSetAttr from "@core/models/AttrSetAttr.model";
import slugify from "slugify";

@Table({
    tableName: 'attribute',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Attribute extends Model<Attribute> implements IAttribute {

    id: number;
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

    get name() {
        return this.getDataValue('name');
    }

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

    static async findAggregatable() {
        return Attribute.findAll({where: {aggregatable: true}, include: [AttrType]});
    }
}

export interface IAttribute {
    id: number;
    name: string;
    slug: string;
    aggregatable?: boolean;
    aggPath?: string;
    type_id: number;
    type?: IAttrType;
    attrSets?: IAttrSet[];
}

export interface IAttributeCreate extends Omit<IAttribute, 'id' | 'slug'> {
}

export enum ATTR_TYPE {
    STRING = 1,
    NUMBER,
    DECIMAL,
    JSON,
    ARRAY,
    BOOLEAN
}
