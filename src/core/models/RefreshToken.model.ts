import User from './User.model'
import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'user_refresh_token',
    timestamps: false
})
export default class RefreshToken extends Model<RefreshToken> {
    @ForeignKey(() => User)
    @Column({
        allowNull: false,
    })
    user_id: number;

    @Column({
        allowNull: false,
    })
    token: string;

    @Column({
        allowNull: false,
    })
    expiryDate: string;

    @BelongsTo(() => User, 'user_id')
    user: User
}


export interface IRefreshToken {
    id?: number;
    user_id: number;
    token: string;
    expiryDate: string;
}
