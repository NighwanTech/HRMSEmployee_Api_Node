import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import router from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ApiError } from './utils/apiError.js';

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(cors());

// Static Uploads Directory Middleware
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Body Parsing Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Register Application Routes
app.use(router);

// Handle 404 Route Not Found
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Centralized Global Error Handler Middleware
app.use(errorHandler);

export default app;
