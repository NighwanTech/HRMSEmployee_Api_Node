import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';
import { TemplateMaster } from '../templateMaster/templateMaster.model.js';
import { TemplateContent } from '../templateContent/templateContent.model.js';
import { DocumentType } from '../documentType/documentType.model.js';

export const GeneratedDocument = sequelize.define(
  'GeneratedDocument',
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
      onDelete: 'RESTRICT',
    },
    templateContentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'template_content_id',
      references: {
        model: TemplateContent,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    documentTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'document_type_id',
      references: {
        model: DocumentType,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    documentName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'document_name',
    },
    outputFormat: {
      type: DataTypes.ENUM('PDF'),
      allowNull: false,
      defaultValue: 'PDF',
      field: 'output_format',
    },
    status: {
      type: DataTypes.ENUM('GENERATING', 'COMPLETED', 'FAILED'),
      allowNull: false,
      defaultValue: 'GENERATING',
      field: 'status',
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'file_path',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'file_name',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    generatedData: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'generated_data',
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'generated_at',
    },

    // Include common fields (is_active, is_deleted, created_by, updated_by, remark, created_at, updated_at, deleted_remarks)
    ...commonModelFields,
  },
  {
    tableName: 'generated_documents',
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

// Model Relationships
TemplateMaster.hasMany(GeneratedDocument, { foreignKey: 'template_id', as: 'generatedDocuments' });
GeneratedDocument.belongsTo(TemplateMaster, { foreignKey: 'template_id', as: 'template' });

TemplateContent.hasMany(GeneratedDocument, { foreignKey: 'template_content_id', as: 'generatedDocuments' });
GeneratedDocument.belongsTo(TemplateContent, { foreignKey: 'template_content_id', as: 'templateContent' });

DocumentType.hasMany(GeneratedDocument, { foreignKey: 'document_type_id', as: 'generatedDocuments' });
GeneratedDocument.belongsTo(DocumentType, { foreignKey: 'document_type_id', as: 'documentType' });
