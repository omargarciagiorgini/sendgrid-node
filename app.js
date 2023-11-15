const express = require('express');
const mailRoutes = require('./routes/index');

const app = express();

app.use(express.json());
app.use('/', mailRoutes);

module.exports = app;