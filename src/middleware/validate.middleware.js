import { ApiError } from '../utils/apiError.js';

/**
 * Middleware factory to validate incoming request data using Joi schemas
 * @param {Object} schema - Joi validation schema object containing body, query, or params
 */
export const validate = (schema) => (req, res, next) => {
  const validSchema = ['body', 'query', 'params'];
  
  for (const key of validSchema) {
    if (schema[key]) {
      const { error, value } = schema[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const formattedErrors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
        }));

        return next(new ApiError(400, 'Validation failed', formattedErrors));
      }

      // Assign cleaned and validated value back to request
      req[key] = value;
    }
  }

  return next();
};
