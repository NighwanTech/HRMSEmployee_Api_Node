import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';
import { TemplateMaster } from '../templateMaster/templateMaster.model.js';

export const TemplateContent = sequelize.define(
  'TemplateContent',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'template_id',
      references: {
        model: TemplateMaster,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    contentType: {
      type: DataTypes.ENUM('EDITOR', 'PDF'),
      allowNull: false,
      defaultValue: 'EDITOR',
      field: 'content_type',
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'content',
    },
    headerImage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'header_image',
    },
    footerImage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'footer_image',
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'inactive'),
      defaultValue: 'draft',
      field: 'status',
    },

    // Include common fields (is_active, is_deleted, created_by, updated_by, remark, created_at, updated_at, deleted_remarks)
    ...commonModelFields,
  },
  {
    tableName: 'template_contents',
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

// Relationships (Without touching TemplateMaster model file)
TemplateMaster.hasOne(TemplateContent, { foreignKey: 'template_id', as: 'content' });
TemplateContent.belongsTo(TemplateMaster, { foreignKey: 'template_id', as: 'template' });
