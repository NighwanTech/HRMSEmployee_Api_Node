import Joi from 'joi';

export const authValidation = {
  signup: {
    body: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required(),
      role: Joi.string().valid('user', 'admin').optional(),
    }),
  },
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },
};
