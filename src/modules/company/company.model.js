import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';

export const Company = sequelize.define(
  'Company',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'company_code',
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'company_name',
    },
    legalName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'legal_name',
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'display_name',
    },
    companyType: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'company_type',
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'industry',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },

    // Tax & Registration Identifiers
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'registration_number',
    },
    cinNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'cin_number',
    },
    gstNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'gst_number',
    },
    panNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'pan_number',
    },
    tanNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tan_number',
    },
    taxIdentificationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tax_identification_number',
    },

    // Contact Emails & Numbers
    officialEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'official_email',
      validate: { isEmail: true },
    },
    hrEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'hr_email',
      validate: { isEmail: true },
    },
    accountsEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'accounts_email',
      validate: { isEmail: true },
    },
    supportEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'support_email',
      validate: { isEmail: true },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'phone_number',
    },
    alternatePhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'alternate_phone_number',
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'website',
    },

    // Registered Address
    registeredAddressLine1: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'registered_address_line_1',
    },
    registeredAddressLine2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'registered_address_line_2',
    },
    registeredCity: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'registered_city',
    },
    registeredState: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'registered_state',
    },
    registeredCountry: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'registered_country',
    },
    registeredPostalCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'registered_postal_code',
    },

    // Office Address
    officeAddressLine1: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'office_address_line_1',
    },
    officeAddressLine2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'office_address_line_2',
    },
    officeCity: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'office_city',
    },
    officeState: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'office_state',
    },
    officeCountry: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'office_country',
    },
    officePostalCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'office_postal_code',
    },

    // Branding & Media
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'logo_url',
    },
    signatureUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'signature_url',
    },
    stampUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'stamp_url',
    },
    letterheadUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'letterhead_url',
    },
    primaryColor: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'primary_color',
    },
    secondaryColor: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'secondary_color',
    },
    fontFamily: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'font_family',
    },

    // Defaults & Localization
    defaultCurrency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
      field: 'default_currency',
    },
    defaultTimezone: {
      type: DataTypes.STRING,
      defaultValue: 'Asia/Kolkata',
      field: 'default_timezone',
    },
    defaultDateFormat: {
      type: DataTypes.STRING,
      defaultValue: 'YYYY-MM-DD',
      field: 'default_date_format',
    },
    defaultLanguage: {
      type: DataTypes.STRING,
      defaultValue: 'en',
      field: 'default_language',
    },

    // Status
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending', 'suspended'),
      defaultValue: 'active',
      field: 'status',
    },

    // Spread common fields (is_active, is_deleted, created_by, updated_by, remark, created_at, updated_at, deleted_remarks)
    ...commonModelFields,
  },
  {
    tableName: 'companies',
    defaultScope: {
      where: {
        isDeleted: false,
      },
    },
    scopes: {
      withDeleted: {
        where: {},
      },
    },
  }
);
