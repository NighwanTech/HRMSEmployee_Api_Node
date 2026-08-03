import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';

export const Example = sequelize.define(
  'Example',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    // Spread common audit and status fields into table definition
    ...commonModelFields,
  },
  {
    tableName: 'examples',
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
