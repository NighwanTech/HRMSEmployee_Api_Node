import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { commonModelFields } from '../../utils/commonFields.js';

export const AdminLogin = sequelize.define(
  'AdminLogin',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ...commonModelFields,
  },
  {
    tableName: 'adminLogin',
    defaultScope: {
      where: {
        isDeleted: false,
      },
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
      withDeleted: {
        where: {},
      },
    },
  }
);
