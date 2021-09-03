import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'discount_b2b',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class B2BDiscount extends Model<B2BDiscount> {

    @Column({
        type: DataType.JSON
    })
    pattern: IB2BDiscountPattern;

    @Column({
        defaultValue: false,
    })
    active: boolean;

}

export interface IB2BDiscount {
    id?: number;
    pattern: IB2BDiscountPattern;
    active?: boolean;
}

export interface IB2BDiscountPattern {
    [manufacturerSlug: string]: {
        value: number;
    };
}
