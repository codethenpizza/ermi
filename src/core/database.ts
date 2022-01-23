import {Sequelize} from 'sequelize-typescript';
import {dbConfig} from 'config';
import ProductVariant from "@core/models/ProductVariant.model";
import {elasticProductService, offerPriorityService} from "@core/services";
import Offer from "@core/models/Offer.model";

export const sequelizeTs = new Sequelize({
    dialect: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.name,
    username: dbConfig.user,
    password: dbConfig.pass,
    models: [
        __dirname + '/models/**/*.model.*',
        __dirname + '/../modules/**/*.model.*',
    ],
    // logging: console.log
    logging: false
});

// set services in Sequelize models
ProductVariant.setElasticProductService(elasticProductService);
Offer.setOfferPriorityService(offerPriorityService);
