require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
// @ts-ignore
const profileRoute = require('./src/routes/profileRoutes')
app.use('/api/profile', profileRoute);


module.exports = app;