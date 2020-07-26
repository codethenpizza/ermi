import {Column, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'user',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class User extends Model<User> {
    @Column
    email: string;

    @Column
    password: string;

    @Column
    name: string;

    @Column({field: 'is_admin'})
    isAdmin: boolean;
}

export type UserI = {
    email: string;
    password: string;
    name: string;
    isAdmin: boolean;
};
