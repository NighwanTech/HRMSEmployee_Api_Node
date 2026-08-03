import Joi from 'joi';

export const exampleValidation = {
  create: {
    body: Joi.object({
      title: Joi.string().min(3).max(100).required(),
      description: Joi.string().allow('', null).optional(),
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
