/**
 * Send a standardized success JSON response
 * @param {Object} res - Express response object
 * @param {string} message - Human readable message
 * @param {Object|Array|null} data - Payload data
 * @param {number} statusCode - HTTP status code (Default: 200)
 */
export const sendSuccess = (res, message = 'Success', data = null, statusCode = 200) => {
  const responsePayload = {
    success: true,
    message,
  };

  if (data !== null) {
    responsePayload.data = data;
  }

  return res.status(statusCode).json(responsePayload);
};

/**
 * Send a standardized error JSON response
 * @param {Object} res - Express response object
 * @param {string} message - Error description message
 * @param {number} statusCode - HTTP status code (Default: 500)
 * @param {Array|Object|null} errors - Specific field validation or detail errors
 */
export const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const responsePayload = {
    success: false,
    message,
  };

  if (errors) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
};
