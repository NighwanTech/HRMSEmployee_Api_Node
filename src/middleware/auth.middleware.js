import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Authentication Middleware to verify JWT Token
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access denied. Authorization token missing or malformed.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    // Attach decoded user payload to request
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired authentication token.'));
  }
};
