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
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'email',
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'full_name',
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'avatar_url',
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
