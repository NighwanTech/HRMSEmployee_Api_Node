import { sequelize } from '../src/config/db.js';

try {
  await sequelize.authenticate();

  const [rows] = await sequelize.query('SELECT id, field_key, field_type FROM dynamic_fields LIMIT 20');
  console.log('Existing dynamic_fields records:', JSON.stringify(rows, null, 2));

  const [enumInfo] = await sequelize.query("SHOW COLUMNS FROM dynamic_fields LIKE 'field_type'");
  console.log('Current field_type column:', JSON.stringify(enumInfo, null, 2));

  const [tableInfo] = await sequelize.query("SHOW COLUMNS FROM dynamic_fields");
  console.log('Full dynamic_fields table schema:', JSON.stringify(tableInfo.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Default: c.Default })), null, 2));

  await sequelize.close();
} catch(e) {
  console.error('Error:', e.message);
  process.exit(1);
}
