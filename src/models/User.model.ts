import {BelongsTo, Column, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import UserAddress, {IUserAddress} from "@models/UserAddress.model";
import B2BDiscountGroup from "@models/B2BDiscountGroup.model";

@Table({
    tableName: 'user',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    deletedAt: true
})
export default class User extends Model<User> {
    @Column({
        unique: true
    })
    email: string;

    @Column({
        unique: true
    })
    phone: string;

    @Column
    password: string;

    @Column
    name: string;

    @Column
    is_admin: boolean;

    @ForeignKey(() => B2BDiscountGroup)
    @Column
    b2b_discount_group_id: number;

    @BelongsTo(() => B2BDiscountGroup)
    b2bDiscountGroup: B2BDiscountGroup;

    @HasMany(() => UserAddress)
    userAddresses: UserAddress[];
}

export type IUser = {
    id?: number;
    email: string;
    phone: string;
    password?: string;
    name: string;
    is_admin?: boolean;
    userAddresses?: IUserAddress;
    b2b_discount_group_id?: number;
    b2bDiscountGroup?: B2BDiscountGroup;
};
