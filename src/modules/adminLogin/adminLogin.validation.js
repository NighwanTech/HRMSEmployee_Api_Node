import Joi from 'joi';

export const adminLoginValidation = {
  login: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Username is required',
      'any.required': 'Username is required',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
  }),
};
