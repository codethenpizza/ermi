import {Column, Model, Table} from "sequelize-typescript";

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

    @Column
    password: string;

    @Column
    name: string;

    @Column
    is_admin: boolean;
}

export type UserI = {
    id?: number;
    email: string;
    password: string;
    name: string;
    is_admin?: boolean;
};
