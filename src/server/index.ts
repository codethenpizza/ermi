import express = require('express');
import {Controller} from "../controllers";

// Create a new express app instance
const app: express.Application = express();

app.use(Controller);

app.listen(3000, function () {
  console.log('App is listening on port 3000!');
});