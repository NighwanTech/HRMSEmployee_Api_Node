import { sendError } from '../utils/response.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Log error stack for unexpected server errors in non-production environments
  if (env.NODE_ENV !== 'production' && !err.isOperational) {
    console.error('💥 UNHANDLED ERROR:', err);
  }

  // Handle Sequelize validation or unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Duplicate entry error';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  // Handle JWT Error types
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  return sendError(res, message, statusCode, errors);
};
