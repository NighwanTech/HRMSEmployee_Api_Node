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

// CORS Configuration — driven entirely by env vars (no hardcoded URLs)
// On Render: set FRONTEND_URL=https://your-app.vercel.app in Environment settings
// To allow ALL origins (open API): set FRONTEND_URL=*
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow requests with no origin (Postman, Render health checks, server-to-server)
      if (!origin) return callback(null, true);
      // Allow wildcard — useful for open APIs or during initial deployment testing
      if (FRONTEND_URL === '*') return callback(null, true);
      // Allow comma-separated list of origins e.g. FRONTEND_URL=https://app1.com,https://app2.com
      const allowed = FRONTEND_URL.split(',').map(o => o.trim());
      if (allowed.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: Origin "${origin}" is not allowed. Set FRONTEND_URL env var on Render.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Root Health Check — required for Render uptime checks and avoids 404 on "/"
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'DocGen API is running 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

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
