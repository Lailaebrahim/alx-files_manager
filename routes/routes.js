const express = require('express');

const appRoutes = express.Router();

appRoutes.get('/', (req, res) => {
    res.send('Hello World!')
});