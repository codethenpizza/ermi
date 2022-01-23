import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import User from "@core/models/User.model";
import Address from "@core/models/Address.model";

@Table({
    tableName: 'user_address',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class UserAddress extends Model<UserAddress> implements IUserAddress {

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
    address?: Address;
}
