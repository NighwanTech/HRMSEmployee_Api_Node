/**
 * Custom Operational Error Class
 * Used to throw HTTP errors with controlled status code and message
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, etc.)
   * @param {string} message - User-friendly error message
   * @param {Array|Object|null} errors - Detailed errors (e.g. validation details)
   */
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
