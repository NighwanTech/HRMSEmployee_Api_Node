import { sequelize } from '../src/config/db.js';

async function checkIndexes() {
  await sequelize.authenticate();
  const [indexes] = await sequelize.query("SHOW INDEX FROM users");
  console.log('All indexes on users table:');
  console.table(indexes.map(i => ({ Table: i.Table, Non_unique: i.Non_unique, Key_name: i.Key_name, Column_name: i.Column_name })));
  await sequelize.close();
}

checkIndexes().catch(console.error);
