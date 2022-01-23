import {BelongsToMany, Column, DataType, HasMany, Model, Table, Unique} from "sequelize-typescript";
import Attribute, {IAttribute} from "@core/models/Attribute.model";
import AttrSetAttr from "@core/models/AttrSetAttr.model";
import slugify from "slugify";
import Product, {IProduct} from "@core/models/Product.model";

@Table({
    tableName: 'attribute_set',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class AttrSet extends Model<AttrSet> implements IAttrSet {

    id: number;

    @Column({
        unique: true
    })
    slug: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @Column({
        type: DataType.JSON
    })
    scheme: string;

    @BelongsToMany(() => Attribute, () => AttrSetAttr)
    attributes: Attribute[];

    @HasMany(() => Product)
    products: Product[];

    get name() {
        return this.getDataValue('name');
    }

    @Unique
    @Column({
        allowNull: false
    })
    set name(val: string) {
        this.setDataValue('slug', slugify(val, {lower: true}));
        this.setDataValue('name', val);
    }
}

export interface IAttrSet {
    id: number;
    name: string;
    slug: string;
    desc?: string;
    scheme?: Object;
    attributes?: IAttribute[];
    products?: IProduct[];
}
