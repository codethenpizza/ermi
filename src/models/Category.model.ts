import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'product_cat',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ProductCategory extends Model<ProductCategory> {

    @Column({
        allowNull: false
    })
    name: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @ForeignKey(() => ProductCategory)
    @Column
    parent_id: number;

    @Column({
        defaultValue: 0
    })
    position: number;

}

export type IProductCategory = {
    name: string;
    desc?: string;
    parent_id?: number;
    position?: number;
};
