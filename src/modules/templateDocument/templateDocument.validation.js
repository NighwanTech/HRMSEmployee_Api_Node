import Joi from 'joi';

export const templateDocumentValidation = {
  uploadDocument: {
    body: Joi.object({
      template_id: Joi.number().integer().positive().required(),
    }),
  },

  getDocumentsByTemplateId: {
    params: Joi.object({
      templateId: Joi.number().integer().positive().required(),
    }),
  },

  getDocumentById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },

  convertDocument: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
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
};
