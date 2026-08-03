import Joi from 'joi';

export const companyValidation = {
  createCompany: {
    body: Joi.object({
      companyCode: Joi.string().trim().required(),
      companyName: Joi.string().trim().required(),
      legalName: Joi.string().trim().allow('', null).optional(),
      displayName: Joi.string().trim().allow('', null).optional(),
      companyType: Joi.string().trim().allow('', null).optional(),
      industry: Joi.string().trim().allow('', null).optional(),
      description: Joi.string().allow('', null).optional(),

      registrationNumber: Joi.string().trim().allow('', null).optional(),
      cinNumber: Joi.string().trim().allow('', null).optional(),
      gstNumber: Joi.string().trim().allow('', null).optional(),
      panNumber: Joi.string().trim().allow('', null).optional(),
      tanNumber: Joi.string().trim().allow('', null).optional(),
      taxIdentificationNumber: Joi.string().trim().allow('', null).optional(),

      officialEmail: Joi.string().email().allow('', null).optional(),
      hrEmail: Joi.string().email().allow('', null).optional(),
      accountsEmail: Joi.string().email().allow('', null).optional(),
      supportEmail: Joi.string().email().allow('', null).optional(),
      phoneNumber: Joi.string().trim().allow('', null).optional(),
      alternatePhoneNumber: Joi.string().trim().allow('', null).optional(),
      website: Joi.string().uri().allow('', null).optional(),

      registeredAddressLine1: Joi.string().allow('', null).optional(),
      registeredAddressLine2: Joi.string().allow('', null).optional(),
      registeredCity: Joi.string().allow('', null).optional(),
      registeredState: Joi.string().allow('', null).optional(),
      registeredCountry: Joi.string().allow('', null).optional(),
      registeredPostalCode: Joi.string().allow('', null).optional(),

      officeAddressLine1: Joi.string().allow('', null).optional(),
      officeAddressLine2: Joi.string().allow('', null).optional(),
      officeCity: Joi.string().allow('', null).optional(),
      officeState: Joi.string().allow('', null).optional(),
      officeCountry: Joi.string().allow('', null).optional(),
      officePostalCode: Joi.string().allow('', null).optional(),

      logoUrl: Joi.string().allow('', null).optional(),
      signatureUrl: Joi.string().allow('', null).optional(),
      stampUrl: Joi.string().allow('', null).optional(),
      letterheadUrl: Joi.string().allow('', null).optional(),
      primaryColor: Joi.string().allow('', null).optional(),
      secondaryColor: Joi.string().allow('', null).optional(),
      fontFamily: Joi.string().allow('', null).optional(),

      defaultCurrency: Joi.string().allow('', null).optional(),
      defaultTimezone: Joi.string().allow('', null).optional(),
      defaultDateFormat: Joi.string().allow('', null).optional(),
      defaultLanguage: Joi.string().allow('', null).optional(),

      status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  updateCompany: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      companyCode: Joi.string().trim().optional(),
      companyName: Joi.string().trim().optional(),
      legalName: Joi.string().trim().allow('', null).optional(),
      displayName: Joi.string().trim().allow('', null).optional(),
      companyType: Joi.string().trim().allow('', null).optional(),
      industry: Joi.string().trim().allow('', null).optional(),
      description: Joi.string().allow('', null).optional(),

      registrationNumber: Joi.string().trim().allow('', null).optional(),
      cinNumber: Joi.string().trim().allow('', null).optional(),
      gstNumber: Joi.string().trim().allow('', null).optional(),
      panNumber: Joi.string().trim().allow('', null).optional(),
      tanNumber: Joi.string().trim().allow('', null).optional(),
      taxIdentificationNumber: Joi.string().trim().allow('', null).optional(),

      officialEmail: Joi.string().email().allow('', null).optional(),
      hrEmail: Joi.string().email().allow('', null).optional(),
      accountsEmail: Joi.string().email().allow('', null).optional(),
      supportEmail: Joi.string().email().allow('', null).optional(),
      phoneNumber: Joi.string().trim().allow('', null).optional(),
      alternatePhoneNumber: Joi.string().trim().allow('', null).optional(),
      website: Joi.string().allow('', null).optional(),

      registeredAddressLine1: Joi.string().allow('', null).optional(),
      registeredAddressLine2: Joi.string().allow('', null).optional(),
      registeredCity: Joi.string().allow('', null).optional(),
      registeredState: Joi.string().allow('', null).optional(),
      registeredCountry: Joi.string().allow('', null).optional(),
      registeredPostalCode: Joi.string().allow('', null).optional(),

      officeAddressLine1: Joi.string().allow('', null).optional(),
      officeAddressLine2: Joi.string().allow('', null).optional(),
      officeCity: Joi.string().allow('', null).optional(),
      officeState: Joi.string().allow('', null).optional(),
      officeCountry: Joi.string().allow('', null).optional(),
      officePostalCode: Joi.string().allow('', null).optional(),

      logoUrl: Joi.string().allow('', null).optional(),
      signatureUrl: Joi.string().allow('', null).optional(),
      stampUrl: Joi.string().allow('', null).optional(),
      letterheadUrl: Joi.string().allow('', null).optional(),
      primaryColor: Joi.string().allow('', null).optional(),
      secondaryColor: Joi.string().allow('', null).optional(),
      fontFamily: Joi.string().allow('', null).optional(),

      defaultCurrency: Joi.string().allow('', null).optional(),
      defaultTimezone: Joi.string().allow('', null).optional(),
      defaultDateFormat: Joi.string().allow('', null).optional(),
      defaultLanguage: Joi.string().allow('', null).optional(),

      status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').optional(),
      remark: Joi.string().allow('', null).optional(),
    }),
  },

  getCompanyById: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
  },

  updateStatus: {
    params: Joi.object({
      id: Joi.number().integer().positive().required(),
    }),
    body: Joi.object({
      status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').required(),
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
