const express = require('express');
const mailRoutes = require('./routes/index');
const cors = require('cors');

const app = express();

// Use CORS middleware
app.use(cors());

app.use(express.json());
app.use('/', mailRoutes);

module.exports = app;