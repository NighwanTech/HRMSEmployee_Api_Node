import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';
import { Company } from '../company/company.model.js';
import { DocumentType } from '../documentType/documentType.model.js';

export const DynamicField = sequelize.define(
  'DynamicField',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // ── Company (optional — useful for multi-company custom fields) ──
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'company_id',
      references: { model: Company, key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },

    // ── Document Type (optional — fields can be reused across doc types) ──
    documentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'document_type_id',
      references: { model: DocumentType, key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },

    // ── Core identity fields ──
    fieldKey: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,           // Globally unique — used in {{field_key}} placeholders
      field: 'field_key',
      validate: {
        is: /^[a-z][a-z0-9_]*$/,   // lowercase snake_case only
      },
    },
    fieldName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'field_name',
    },

    // ── Field type (Phase 4A values — uppercase) ──
    fieldType: {
      type: DataTypes.ENUM('TEXT', 'NUMBER', 'DATE', 'CURRENCY', 'EMAIL', 'PHONE', 'BOOLEAN'),
      defaultValue: 'TEXT',
      field: 'field_type',
    },

    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'description',
    },

    // ── Data source ──
    dataSource: {
      type: DataTypes.ENUM('EMPLOYEE', 'COMPANY', 'PROFILE', 'SYSTEM', 'MANUAL'),
      defaultValue: 'MANUAL',
      allowNull: false,
      field: 'data_source',
    },

    // ── Extra UX/builder fields (preserved for future Template Builder use) ──
    placeholder: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'placeholder',
    },
    defaultValue: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'default_value',
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_required',
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_system',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'display_order',
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'options',
    },
    validationRules: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'validation_rules',
    },

    // ── Audit / soft-delete fields from commonModelFields ──
    ...commonModelFields,
  },
  {
    tableName: 'dynamic_fields',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      where: { isDeleted: false },
    },
    scopes: {
      withDeleted: { where: {} },
    },
  }
);

// ── Associations ──
Company.hasMany(DynamicField, { foreignKey: 'company_id', as: 'dynamicFields' });
DynamicField.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

DocumentType.hasMany(DynamicField, { foreignKey: 'document_type_id', as: 'dynamicFields' });
DynamicField.belongsTo(DocumentType, { foreignKey: 'document_type_id', as: 'documentType' });
