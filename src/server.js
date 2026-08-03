import app from './app.js';
import { env } from './config/env.js';
import { connectDB, sequelize } from './config/db.js';

// Explicitly import models so Sequelize registers them before database sync
import './modules/user/user.model.js';
import './modules/company/company.model.js';
import './modules/profile/profile.model.js';
import './modules/documentType/documentType.model.js';
import './modules/dynamicField/dynamicField.model.js';
import './modules/templateMaster/templateMaster.model.js';
import './modules/templateContent/templateContent.model.js';
import './modules/templateDocument/templateDocument.model.js';
import './modules/generatedDocument/generatedDocument.model.js';

const startServer = async () => {
  try {
    // 1. Connect to MySQL Database
    await connectDB();

    // 2. Synchronize Sequelize Models
    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('🔄 Sequelize models synchronized with database tables.');
    }

    // 3. Start HTTP Server
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Enterprise Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
      console.log(`📚 Swagger Documentation live at: http://localhost:${env.PORT}/api-docs`);
    });

    // Graceful Shutdown Handlers
    const shutdown = (signal) => {
      console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await sequelize.close();
        console.log('🔒 Database connection closed. Server process exited.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
