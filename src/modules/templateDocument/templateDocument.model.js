import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';
import { TemplateMaster } from '../templateMaster/templateMaster.model.js';

export const TemplateDocument = sequelize.define(
  'TemplateDocument',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'template_id',
      references: {
        model: TemplateMaster,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    originalFileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'original_file_name',
    },
    originalFilePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'original_file_path',
    },
    originalFileType: {
      type: DataTypes.ENUM('PDF', 'DOCX', 'DOC'),
      allowNull: false,
      field: 'original_file_type',
    },
    convertedFilePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'converted_file_path',
    },
    convertedContent: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'converted_content',
    },
    pageCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'page_count',
    },
    status: {
      type: DataTypes.ENUM('UPLOADED', 'CONVERTED', 'FAILED'),
      allowNull: false,
      defaultValue: 'UPLOADED',
      field: 'status',
    },
    conversionError: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'conversion_error',
    },
    
    // Spread common fields (isActive, isDeleted, createdBy, updatedBy, remark, createdAt, updatedAt, deletedRemarks)
    ...commonModelFields,
  },
  {
    tableName: 'template_documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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

// Define Relationship
TemplateMaster.hasMany(TemplateDocument, { foreignKey: 'template_id', as: 'documents' });
TemplateDocument.belongsTo(TemplateMaster, { foreignKey: 'template_id', as: 'template' });
