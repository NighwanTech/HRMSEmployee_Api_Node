import Joi from 'joi';

export const generatedDocumentValidation = {
  // POST /api/v1/generated-documents
  generateDocument: {
    body: Joi.object({
      templateId: Joi.number().integer().positive().required(),
      documentName: Joi.string().trim().max(255).required(),
      employeeId: Joi.number().integer().positive().optional(),
      companyId: Joi.number().integer().positive().optional(),
      profileId: Joi.number().integer().positive().optional(),
      data: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
    }),
  },

  // POST /api/v1/generated-documents/resolve-data
  resolveDocumentData: {
    body: Joi.object({
      templateId: Joi.number().integer().positive().required(),
      employeeId: Joi.number().integer().positive().optional(),
      companyId: Joi.number().integer().positive().optional(),
      profileId: Joi.number().integer().positive().optional(),
      manualData: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
    }),
  },

  getDocumentById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },

  getDocuments: {
    query: Joi.object({
      templateId: Joi.number().integer().positive().optional(),
      status: Joi.string().valid('GENERATING', 'COMPLETED', 'FAILED').optional(),
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
export default generatedDocumentValidation;
