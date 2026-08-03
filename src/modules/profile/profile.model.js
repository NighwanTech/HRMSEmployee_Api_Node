import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';
import { Company } from '../company/company.model.js';

export const Profile = sequelize.define(
  'Profile',
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
    profileCode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'profile_code',
    },
    profileName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'profile_name',
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'job_title',
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'department',
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'designation',
    },
    jobLevel: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'job_level',
    },
    employmentType: {
      type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'intern', 'freelance'),
      defaultValue: 'full_time',
      field: 'employment_type',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'description',
    },

    // Include common fields (is_active, is_deleted, created_by, updated_by, remark, created_at, updated_at, deleted_remarks)
    ...commonModelFields,
  },
  {
    tableName: 'profiles',
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

// Establish Model Relationships
Company.hasMany(Profile, { foreignKey: 'company_id', as: 'profiles' });
Profile.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
