import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';
import { Company } from '../company/company.model.js';
import { DocumentType } from '../documentType/documentType.model.js';
import { Profile } from '../profile/profile.model.js';

export const TemplateMaster = sequelize.define(
  'TemplateMaster',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'company_id',
      references: {
        model: Company,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    documentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'document_type_id',
      references: {
        model: DocumentType,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'profile_id',
      references: {
        model: Profile,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    templateCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'template_code',
    },
    templateName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'template_name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0.0',
      field: 'version',
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive', 'archived'),
      defaultValue: 'draft',
      field: 'status',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_default',
    },

    // Include common fields (is_active, is_deleted, created_by, updated_by, remark, created_at, updated_at, deleted_remarks)
    ...commonModelFields,
  },
  {
    tableName: 'template_masters',
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

// Model Relationships
Company.hasMany(TemplateMaster, { foreignKey: 'company_id', as: 'templates' });
TemplateMaster.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

DocumentType.hasMany(TemplateMaster, { foreignKey: 'document_type_id', as: 'templates' });
TemplateMaster.belongsTo(DocumentType, { foreignKey: 'document_type_id', as: 'documentType' });

Profile.hasMany(TemplateMaster, { foreignKey: 'profile_id', as: 'templates' });
TemplateMaster.belongsTo(Profile, { foreignKey: 'profile_id', as: 'profile' });
