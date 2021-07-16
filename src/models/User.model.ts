import {Column, HasMany, Model, Table} from "sequelize-typescript";
import UserAddress, {IUserAddress} from "@models/UserAddress.model";

@Table({
    tableName: 'user',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
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

    @HasMany(() => UserAddress)
    userAddresses: UserAddress[];
}

export type IUser = {
    id?: number;
    email: string;
    phone: string;
    password: string;
    name: string;
    is_admin?: boolean;
    userAddresses?: IUserAddress;
};
