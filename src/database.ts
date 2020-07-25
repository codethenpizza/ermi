import {Sequelize} from 'sequelize-typescript';
import {dbConfig} from 'config';
import User from "@models/User.model";

export const sequelize = new Sequelize({
    dialect: 'mysql',
    database: dbConfig.dbName,
    username: dbConfig.user,
    password: dbConfig.pass,
    models: [User],
});
