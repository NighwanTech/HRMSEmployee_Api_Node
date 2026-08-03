import { Sequelize } from 'sequelize';
import { env } from './env.js';

// Initialize Sequelize ORM with MySQL connection settings
export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'mysql',
    logging: env.DB_LOGGING ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true, // Automatically add createdAt and updatedAt timestamps
      underscored: true, // Use snake_case column names in DB table
    },
  }
);

// Function to test and establish DB connection
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully via Sequelize ORM.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error.message);
    // In production, you may choose to handle connection retries or exit process gracefully
  }
};
