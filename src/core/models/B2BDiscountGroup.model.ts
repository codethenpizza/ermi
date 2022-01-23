import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import B2BDiscount from "@core/models/B2BDiscount.model";

@Table({
    tableName: 'discount_b2b_group',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class B2BDiscountGroup extends Model<B2BDiscountGroup> {

    @Column({
        allowNull: false
    })
    name: string;

    @ForeignKey(() => B2BDiscount)
    @Column({
        allowNull: false
    })
    b2b_discount_id: number;

    @BelongsTo(() => B2BDiscount)
    discount: B2BDiscount;

}

export interface IB2BDiscountGroup {
    id?: number;
    name: string;
    b2b_discount_id: number;
    discount?: B2BDiscount;
}
