import Joi from 'joi';

export const userValidation = {
  getUserById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },
  updateProfile: {
    body: Joi.object({
      name: Joi.string().min(2).max(50).optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },
  softDelete: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      deletedRemarks: Joi.string().allow('', null).optional(),
    }),
  },
  bulkDelete: {
    body: Joi.object({
      ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
      deletedRemarks: Joi.string().allow('', null).optional(),
    }),
  },
};
