import 'module-alias/register';
import express, {Application} from 'express';
import bodyParser from "body-parser";
import config from 'config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';

import {Controller} from "@controllers/index";

import "@db";

const app: Application = express();
const PORT = config.app.port;

app.use(fileUpload({
    createParentPath: true
}))
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/public', express.static(`${__dirname}/../../public`));
app.use('/api', Controller);

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}!`);
});
