import { sequelize } from '../src/config/db.js';

async function dropDuplicateIndexes() {
  await sequelize.authenticate();
  console.log('✅ Connected to database. Dropping duplicate email indexes on users...');
  
  // We drop email_2 to email_63
  for (let i = 2; i <= 63; i++) {
    try {
      await sequelize.query(`ALTER TABLE users DROP INDEX email_${i}`);
      console.log(`Dropped index email_${i}`);
    } catch (err) {
      console.warn(`Could not drop email_${i}:`, err.message);
    }
  }

  console.log('🎉 Index cleanup completed.');
  await sequelize.close();
}

dropDuplicateIndexes().catch(console.error);
