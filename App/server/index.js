require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = [
  'https://outty-app-yyq6.vercel.app',
  'http://localhost:8081', // keep for local dev
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Handle preflight requests for all routes
app.options('*', cors());

app.use(express.json());

const profileRoute = require('./src/routes/profileRoutes');
const photoRoute = require('./src/routes/photoRoutes');

app.use('/api/profile', profileRoute);
app.use('/api/photos', photoRoute);

module.exports = app;