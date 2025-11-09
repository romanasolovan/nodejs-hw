
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errors as celebrateErrors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import notesRouter from './routes/notesRoutes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(logger);
app.use(express.json());
app.use(cors());

app.use('/notes', notesRouter);

// celebrate validation errors middleware
app.use(celebrateErrors());

// 404 handler
app.use(notFoundHandler);

// global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

