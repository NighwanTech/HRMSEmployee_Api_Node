import Joi from 'joi';

export const templateContentValidation = {
  createContent: {
    body: Joi.object({
      templateId: Joi.number().integer().positive().required(),
      contentType: Joi.string().valid('EDITOR', 'PDF').default('EDITOR').required(),
      content: Joi.string().allow('', null).optional(),
      headerImage: Joi.string().allow('', null).optional(),
      footerImage: Joi.string().allow('', null).optional(),
      status: Joi.string().valid('draft', 'active', 'inactive').default('draft').optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  getContentByTemplateId: {
    params: Joi.object({
      templateId: Joi.number().integer().positive().required(),
    }),
  },

  updateContent: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      content: Joi.string().allow('', null).optional(),
      headerImage: Joi.string().allow('', null).optional(),
      footerImage: Joi.string().allow('', null).optional(),
      status: Joi.string().valid('draft', 'active', 'inactive').optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  deleteContent: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },

  uploadImage: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      type: Joi.string().valid('header', 'footer').required(),
    }),
  },

  removeImage: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      type: Joi.string().valid('header', 'footer').required(),
    }),
    query: Joi.object({
      type: Joi.string().valid('header', 'footer').optional(),
    }),
  },
};
