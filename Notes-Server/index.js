const express = require('express');
const cors = require('cors')
const api = require('./server/api');

const app = express();

app.use(express.urlencoded({
    extended: false
}));

app.use(express.json());

app.use(cors());

const swaggerUi = require('./swagger/index').swaggerUi;
const swaggerDocument = require('./swagger/index').swaggerDocument;

//api documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//api root
app.use('/api', api);

//Default api response for unknown URL
app.use(function (req, res) {
    res.status(404).send('Not Found');
});

module.exports = app;