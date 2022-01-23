import {Column, DataType, Model, Table, Unique} from "sequelize-typescript";
import slugify from "slugify";

@Table({
    tableName: 'vendor',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Vendor extends Model<Vendor> implements IVendor {

    @Column({
        unique: true
    })
    slug: string;

    get name() {
        return this.getDataValue('name');
    }

    @Unique
    @Column({
        allowNull: false,
        type: DataType.STRING,
        field: 'name'
    })
    set name(val: IVendor['name']) {
        this.setDataValue('slug', slugify(val, {lower: true}));
        this.setDataValue('name', val);
    }

}

export interface IVendor {
    id?: number;
    name: string;
    slug: string;
}

export interface IVendorCreate extends Omit<IVendor, 'id' | 'slug'> {
}
