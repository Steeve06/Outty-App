import 'dotenv/config';
import express from 'express';
import profileRoute from './src/routes/profileRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/profile', profileRoute);

export default app;
