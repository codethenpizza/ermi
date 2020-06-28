import 'module-alias/register';
import express, {Application} from 'express';
import bodyParser from "body-parser";
import config from 'config';

import {Controller} from "../controllers";
import {connectDb} from '../database'

const app: Application = express();
const PORT = config.app.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', Controller);

const {uri, dbName, user, pass} = config.dbConfig;
connectDb(uri, {dbName, user, pass});

app.listen(PORT, () => {
    console.log('App is listening on port 3000!');
});
