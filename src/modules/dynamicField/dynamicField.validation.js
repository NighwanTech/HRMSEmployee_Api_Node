import Joi from 'joi';

const FIELD_TYPES = ['TEXT', 'NUMBER', 'DATE', 'CURRENCY', 'EMAIL', 'PHONE', 'BOOLEAN'];
const DATA_SOURCES = ['EMPLOYEE', 'COMPANY', 'PROFILE', 'SYSTEM', 'MANUAL'];

// Reusable snake_case field_key validator
const fieldKeySchema = Joi.string()
  .trim()
  .max(150)
  .pattern(/^[a-z][a-z0-9_]*$/, 'lowercase snake_case')
  .messages({
    'string.pattern.name': 'field_key must be lowercase snake_case (e.g. employee_name, joining_date)',
  });

export const dynamicFieldValidation = {
  // ── POST /api/v1/dynamic-fields ──────────────────────────────────────────
  createDynamicField: {
    body: Joi.object({
      companyId:       Joi.number().integer().positive().optional().allow(null),
      documentTypeId:  Joi.number().integer().positive().optional().allow(null),
      fieldKey:        fieldKeySchema.required(),
      fieldName:       Joi.string().trim().max(150).required(),
      fieldType:       Joi.string().valid(...FIELD_TYPES).default('TEXT'),
      dataSource:      Joi.string().valid(...DATA_SOURCES).default('MANUAL'),
      description:     Joi.string().max(500).allow('', null).optional(),
      placeholder:     Joi.string().allow('', null).optional(),
      defaultValue:    Joi.string().allow('', null).optional(),
      isRequired:      Joi.boolean().optional(),
      isSystem:        Joi.boolean().optional(),
      isActive:        Joi.boolean().optional(),
      displayOrder:    Joi.number().integer().optional(),
      options:         Joi.array().items(Joi.any()).allow(null).optional(),
      validationRules: Joi.object().allow(null).optional(),
      remark:          Joi.string().allow('', null).optional(),
    }),
  },

  // ── PUT /api/v1/dynamic-fields/:id ───────────────────────────────────────
  updateDynamicField: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      companyId:       Joi.number().integer().positive().optional().allow(null),
      documentTypeId:  Joi.number().integer().positive().optional().allow(null),
      fieldKey:        fieldKeySchema.optional(),
      fieldName:       Joi.string().trim().max(150).optional(),
      fieldType:       Joi.string().valid(...FIELD_TYPES).optional(),
      dataSource:      Joi.string().valid(...DATA_SOURCES).optional(),
      description:     Joi.string().max(500).allow('', null).optional(),
      placeholder:     Joi.string().allow('', null).optional(),
      defaultValue:    Joi.string().allow('', null).optional(),
      isRequired:      Joi.boolean().optional(),
      isSystem:        Joi.boolean().optional(),
      isActive:        Joi.boolean().optional(),
      displayOrder:    Joi.number().integer().optional(),
      options:         Joi.array().items(Joi.any()).allow(null).optional(),
      validationRules: Joi.object().allow(null).optional(),
      remark:          Joi.string().allow('', null).optional(),
    }),
  },

  // ── GET /api/v1/dynamic-fields (with filters) ────────────────────────────
  getAllDynamicFields: {
    query: Joi.object({
      document_type_id: Joi.number().integer().positive().optional(),
      field_type:       Joi.string().valid(...FIELD_TYPES).optional(),
      data_source:      Joi.string().valid(...DATA_SOURCES).optional(),
      is_active:        Joi.boolean().truthy('true').falsy('false').optional(),
      search:           Joi.string().max(200).allow('', null).optional(),
    }),
  },

  // ── GET /api/v1/dynamic-fields/:id ───────────────────────────────────────
  getDynamicFieldById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },

  // ── GET /api/v1/dynamic-fields/document-type/:documentTypeId ─────────────
  getByDocumentType: {
    params: Joi.object({
      documentTypeId: Joi.number().integer().positive().required(),
    }),
  },

  // ── DELETE /api/v1/dynamic-fields/:id ────────────────────────────────────
  softDelete: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      deletedRemarks: Joi.string().allow('', null).optional(),
    }),
  },

  // ── POST /api/v1/dynamic-fields/bulk-delete ──────────────────────────────
  bulkDelete: {
    body: Joi.object({
      ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
      deletedRemarks: Joi.string().allow('', null).optional(),
    }),
  },
};
