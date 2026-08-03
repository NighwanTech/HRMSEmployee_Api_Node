import Joi from 'joi';

export const documentTypeValidation = {
  createDocumentType: {
    body: Joi.object({
      companyId: Joi.number().integer().positive().required(),
      documentTypeCode: Joi.string().trim().required(),
      documentTypeName: Joi.string().trim().required(),
      description: Joi.string().allow('', null).optional(),
      category: Joi.string().trim().allow('', null).optional(),
      status: Joi.string().valid('active', 'inactive', 'draft', 'archived').optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  updateDocumentType: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      companyId: Joi.number().integer().positive().optional(),
      documentTypeCode: Joi.string().trim().optional(),
      documentTypeName: Joi.string().trim().optional(),
      description: Joi.string().allow('', null).optional(),
      category: Joi.string().trim().allow('', null).optional(),
      status: Joi.string().valid('active', 'inactive', 'draft', 'archived').optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  getDocumentTypeById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },

  updateStatus: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      status: Joi.string().valid('active', 'inactive', 'draft', 'archived').required(),
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
