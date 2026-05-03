require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: ['http://localhost:8081', 'https://outty-app-yyq6.vercel.app/']
}));
app.use(express.json());

// @ts-ignore
const profileRoute = require('./src/routes/profileRoutes');
// @ts-ignore
const photoRoute = require('./src/routes/photoRoutes');

app.use('/api/profile', profileRoute);
app.use('/api/photos', photoRoute);

module.exports = app;