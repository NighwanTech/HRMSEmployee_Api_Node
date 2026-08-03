import Joi from 'joi';

export const profileValidation = {
  createProfile: {
    body: Joi.object({
      companyId: Joi.number().integer().positive().required(),
      profileCode: Joi.string().trim().required(),
      profileName: Joi.string().trim().required(),
      jobTitle: Joi.string().trim().allow('', null).optional(),
      department: Joi.string().trim().allow('', null).optional(),
      designation: Joi.string().trim().allow('', null).optional(),
      jobLevel: Joi.string().trim().allow('', null).optional(),
      employmentType: Joi.string()
        .valid('full_time', 'part_time', 'contract', 'intern', 'freelance')
        .optional(),
      description: Joi.string().allow('', null).optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  updateProfile: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      companyId: Joi.number().integer().positive().optional(),
      profileCode: Joi.string().trim().optional(),
      profileName: Joi.string().trim().optional(),
      jobTitle: Joi.string().trim().allow('', null).optional(),
      department: Joi.string().trim().allow('', null).optional(),
      designation: Joi.string().trim().allow('', null).optional(),
      jobLevel: Joi.string().trim().allow('', null).optional(),
      employmentType: Joi.string()
        .valid('full_time', 'part_time', 'contract', 'intern', 'freelance')
        .optional(),
      description: Joi.string().allow('', null).optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  getProfileById: {
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

  bulkDelete: {
    body: Joi.object({
      ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
      deletedRemarks: Joi.string().allow('', null).optional(),
    }),
  },
};
