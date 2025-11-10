
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errors as celebrateErrors } from 'celebrate';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import notesRouter from './routes/notesRoutes.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(logger);
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/notes', notesRouter);
app.use('/auth', authRouter);
app.use('/users', userRoutes);

app.use(celebrateErrors());


app.use(notFoundHandler);


app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

