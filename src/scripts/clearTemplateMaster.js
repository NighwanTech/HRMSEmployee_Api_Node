import { sequelize } from '../config/db.js';

async function forceHardDeleteTemplateMasters() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Running raw hard DELETE SQL statements...');

    // Disable foreign key checks temporarily to allow clean data purge
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Hard delete all rows from template tables
    const [resContent] = await sequelize.query('DELETE FROM template_contents;');
    const [resDocs] = await sequelize.query('DELETE FROM template_documents;');
    const [resMasters] = await sequelize.query('DELETE FROM template_masters;');

    // Reset AUTO_INCREMENT sequence back to 1
    await sequelize.query('ALTER TABLE template_masters AUTO_INCREMENT = 1;');
    await sequelize.query('ALTER TABLE template_contents AUTO_INCREMENT = 1;');
    await sequelize.query('ALTER TABLE template_documents AUTO_INCREMENT = 1;');

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('✅ Hard delete completed! All records purged from template_masters table without altering/dropping table structures.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error executing hard delete:', error);
    process.exit(1);
  }
}

forceHardDeleteTemplateMasters();
