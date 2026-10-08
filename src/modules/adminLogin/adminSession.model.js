import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { AdminLogin } from './adminLogin.model.js';

export const AdminSession = sequelize.define(
  'AdminSession',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'admin_id',
      references: {
        model: AdminLogin,
        key: 'id',
      },
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deviceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Desktop',
      field: 'device_type',
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Chrome',
    },
    os: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Windows',
    },
    ipAddress: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: '127.0.0.1',
      field: 'ip_address',
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: 'Local Machine',
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_active_at',
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_revoked',
    },
  },
  {
    tableName: 'adminSessions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

AdminLogin.hasMany(AdminSession, { foreignKey: 'admin_id', as: 'sessions' });
AdminSession.belongsTo(AdminLogin, { foreignKey: 'admin_id', as: 'admin' });
