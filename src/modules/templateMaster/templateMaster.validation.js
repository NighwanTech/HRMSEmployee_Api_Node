import Joi from 'joi';

export const templateMasterValidation = {
  createTemplate: {
    body: Joi.object({
      companyId: Joi.number().integer().positive().required(),
      documentTypeId: Joi.number().integer().positive().required(),
      profileId: Joi.number().integer().positive().allow(null).optional(),
      templateCode: Joi.string().trim().required(),
      templateName: Joi.string().trim().required(),
      description: Joi.string().allow('', null).optional(),
      version: Joi.string().trim().optional(),
      status: Joi.string().valid('draft', 'active', 'inactive', 'archived').optional(),
      isDefault: Joi.boolean().optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  updateTemplate: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      companyId: Joi.number().integer().positive().optional(),
      documentTypeId: Joi.number().integer().positive().optional(),
      profileId: Joi.number().integer().positive().allow(null).optional(),
      templateCode: Joi.string().trim().optional(),
      templateName: Joi.string().trim().optional(),
      description: Joi.string().allow('', null).optional(),
      version: Joi.string().trim().optional(),
      status: Joi.string().valid('draft', 'active', 'inactive', 'archived').optional(),
      isDefault: Joi.boolean().optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  getTemplateById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },

  updateStatus: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      status: Joi.string().valid('draft', 'active', 'inactive', 'archived').required(),
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
