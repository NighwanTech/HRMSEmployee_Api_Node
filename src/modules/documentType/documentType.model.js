import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';
import { Company } from '../company/company.model.js';

export const DocumentType = sequelize.define(
  'DocumentType',
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
    documentTypeCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'document_type_code',
    },
    documentTypeName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'document_type_name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'category',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'draft', 'archived'),
      defaultValue: 'active',
      field: 'status',
    },

    // Spread common audit and status fields into model definition
    ...commonModelFields,
  },
  {
    tableName: 'document_types',
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
Company.hasMany(DocumentType, { foreignKey: 'company_id', as: 'documentTypes' });
DocumentType.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
