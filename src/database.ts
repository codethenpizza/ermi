import {Sequelize} from 'sequelize-typescript';
import {dbConfig} from 'config';

export const sequelizeTs = new Sequelize({
    dialect: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.name,
    username: dbConfig.user,
    password: dbConfig.pass,
    models: [
        __dirname + '/models/**/*.model.*',
        __dirname + '/modules/**/*.model.*',
        __dirname + '../migrations/service/**/*.model.*',

    ],
    // logging: console.log
    logging: false
});
