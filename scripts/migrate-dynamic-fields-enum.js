/**
 * migrate-dynamic-fields-enum.js
 *
 * Strategy (MySQL ENUM case-insensitivity workaround):
 *  1. Convert field_type to VARCHAR temporarily.
 *  2. UPDATE all old values to new uppercase values.
 *  3. Convert back to ENUM with only the new uppercase values.
 *  4. Add data_source column (if missing).
 *  5. Add UNIQUE constraint on field_key (if missing).
 *
 * Run: node scripts/migrate-dynamic-fields-enum.js
 */

import { sequelize } from '../src/config/db.js';

const FIELD_TYPE_MAP = {
  text:        'TEXT',
  textarea:    'TEXT',
  number:      'NUMBER',
  date:        'DATE',
  select:      'TEXT',
  multiselect: 'TEXT',
  checkbox:    'BOOLEAN',
  radio:       'TEXT',
  email:       'EMAIL',
  file:        'TEXT',
};

async function migrate() {
  await sequelize.authenticate();
  console.log('✅ Database connection established.');

  // ── Step 1: Convert field_type to VARCHAR to escape ENUM constraints ─────
  console.log('\n🔄 Step 1: Converting field_type to VARCHAR(50)...');
  await sequelize.query(`
    ALTER TABLE dynamic_fields MODIFY COLUMN field_type VARCHAR(50) DEFAULT 'TEXT'
  `);
  console.log('✅ field_type is now VARCHAR(50).');

  // ── Step 2: Remap all old lowercase values to new uppercase values ────────
  console.log('\n🔄 Step 2: Remapping field_type values...');
  for (const [oldVal, newVal] of Object.entries(FIELD_TYPE_MAP)) {
    const [result] = await sequelize.query(
      `UPDATE dynamic_fields SET field_type = ? WHERE field_type = ?`,
      { replacements: [newVal, oldVal] }
    );
    if (result.affectedRows > 0) {
      console.log(`   "${oldVal}" → "${newVal}" (${result.affectedRows} row(s) updated)`);
    }
  }
  // Catch any unknown values and set to TEXT
  await sequelize.query(
    `UPDATE dynamic_fields SET field_type = 'TEXT' WHERE field_type NOT IN ('TEXT','NUMBER','DATE','CURRENCY','EMAIL','PHONE','BOOLEAN')`
  );
  console.log('✅ All field_type values remapped.');

  // ── Step 3: Convert field_type back to ENUM with new uppercase values ─────
  console.log('\n🔄 Step 3: Converting field_type back to ENUM (uppercase only)...');
  await sequelize.query(`
    ALTER TABLE dynamic_fields
    MODIFY COLUMN field_type
    ENUM('TEXT','NUMBER','DATE','CURRENCY','EMAIL','PHONE','BOOLEAN')
    NOT NULL DEFAULT 'TEXT'
  `);
  console.log('✅ field_type ENUM finalized: TEXT, NUMBER, DATE, CURRENCY, EMAIL, PHONE, BOOLEAN');

  // ── Step 4: Add data_source column if missing ─────────────────────────────
  const [cols] = await sequelize.query("SHOW COLUMNS FROM dynamic_fields LIKE 'data_source'");
  if (cols.length === 0) {
    console.log('\n🔄 Step 4: Adding data_source column...');
    await sequelize.query(`
      ALTER TABLE dynamic_fields
      ADD COLUMN data_source
      ENUM('EMPLOYEE','COMPANY','PROFILE','SYSTEM','MANUAL')
      NOT NULL DEFAULT 'MANUAL'
      AFTER field_type
    `);
    console.log('✅ data_source column added with default MANUAL.');
  } else {
    console.log('\nℹ️  Step 4: data_source column already exists. Skipping.');
  }

  // ── Step 5: Add UNIQUE constraint on field_key if missing ─────────────────
  const [idxRows] = await sequelize.query(`
    SHOW INDEX FROM dynamic_fields WHERE Key_name = 'dynamic_fields_field_key'
  `);
  if (idxRows.length === 0) {
    // Check for duplicate field_key values first
    const [dupes] = await sequelize.query(`
      SELECT field_key, COUNT(*) as cnt
      FROM dynamic_fields
      WHERE is_deleted = 0
      GROUP BY field_key
      HAVING cnt > 1
    `);
    if (dupes.length > 0) {
      console.warn('\n⚠️  Step 5: DUPLICATE field_key values found — cannot add UNIQUE constraint:');
      dupes.forEach(d => console.warn(`   "${d.field_key}" appears ${d.cnt} times`));
      console.warn('   Please clean up duplicates manually, then re-run this script.');
    } else {
      console.log('\n🔄 Step 5: Adding UNIQUE constraint on field_key...');
      await sequelize.query(`
        ALTER TABLE dynamic_fields ADD UNIQUE INDEX dynamic_fields_field_key (field_key)
      `);
      console.log('✅ UNIQUE constraint added on field_key.');
    }
  } else {
    console.log('\nℹ️  Step 5: UNIQUE constraint on field_key already exists. Skipping.');
  }

  // ── Step 6: Final state report ────────────────────────────────────────────
  const [finalRows] = await sequelize.query(
    'SELECT id, field_key, field_type, data_source FROM dynamic_fields'
  );
  console.log('\n📋 Final record state:');
  console.table(finalRows);

  const [finalSchema] = await sequelize.query(
    "SHOW COLUMNS FROM dynamic_fields WHERE Field IN ('field_type','data_source','field_key')"
  );
  console.log('\n📋 Final column definitions:');
  console.table(finalSchema.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null, Default: c.Default, Key: c.Key })));

  await sequelize.close();
  console.log('\n🎉 Migration complete. You can now restart the backend server.\n');
}

migrate().catch((err) => {
  console.error('💥 Migration failed:', err.message);
  process.exit(1);
});
