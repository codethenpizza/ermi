import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import User from "@models/User.model";
import Address from "@models/Address.model";

@Table({
    tableName: 'user_address',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class UserAddress extends Model<UserAddress> {

    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
    user_id: number;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => Address)
    @Column({
        allowNull: false,
    })
    address_id: number;

    @BelongsTo(() => Address)
    address: Address;
}

export interface IUserAddress {
    id?: number;
    user_id: number;
    address_id: number;
}
