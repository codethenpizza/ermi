import {Sequelize} from 'sequelize-typescript';
import {dbConfig} from 'config';

export const sequelize = new Sequelize({
    dialect: 'mysql',
    database: dbConfig.dbName,
    username: dbConfig.user,
    password: dbConfig.pass,
    models: [
        __dirname + '/models/**/*.model.*',
        __dirname + '/modules/**/*.model.*'
    ],
    logging: true
});
