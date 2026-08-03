import { DataTypes } from 'sequelize';

/**
 * Common fields mixin/utility to be included in all Sequelize models.
 * 
 * Fields included:
 * - is_active (BOOLEAN, default: true)
 * - is_deleted (BOOLEAN, default: false)
 * - created_by (INTEGER, nullable)
 * - updated_by (INTEGER, nullable)
 * - remark (TEXT, nullable)
 * - created_at (DATE, handled by Sequelize or explicit timestamp)
 * - updated_at (DATE, handled by Sequelize or explicit timestamp)
 * - deleted_remarks (TEXT, nullable)
 */
export const commonModelFields = {
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'updated_by',
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'remark',
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at',
  },
  deletedRemarks: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'deleted_remarks',
  },
};
