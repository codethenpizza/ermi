import {BelongsTo, Column, ForeignKey, HasMany, HasOne, Model, Table} from "sequelize-typescript";
import UserAddress, {IUserAddress} from "@core/models/UserAddress.model";
import B2BDiscountGroup from "@core/models/B2BDiscountGroup.model";
import RefreshToken from "@core/models/RefreshToken.model";

@Table({
    tableName: 'user',
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    deletedAt: 'deleted_at'
})
export default class User extends Model<User> implements IUser {
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

    @HasOne(() => RefreshToken)
    refreshToken: RefreshToken;
}

export interface IUser {
    id?: number;
    email: string;
    phone: string;
    password: string;
    name: string;
    is_admin?: boolean;
    userAddresses?: IUserAddress[];
    b2b_discount_group_id?: number;
    b2bDiscountGroup?: B2BDiscountGroup;
}

export interface IUserCreate extends Omit<IUser, 'id' | 'userAddresses' | 'b2bDiscountGroup'> {
}

export type IUserJWTPayload = Omit<IUser, 'b2bDiscountGroup' | 'userAddresses' | 'is_admin'>

export type IAdminUserJWTPayload = Pick<IUserJWTPayload, 'email' | 'name' | 'id'>
