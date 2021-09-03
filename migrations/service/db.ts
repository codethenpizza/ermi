import {Sequelize} from "sequelize-typescript";
import {dbConfig} from 'config';

export const migrationSequelizeTs = new Sequelize({
    dialect: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.name,
    username: dbConfig.user,
    password: dbConfig.pass,
    models: [
        __dirname + '**/*.model.*',
    ],
    // logging: console.log
    logging: false
});
