/**
 * test-dynamic-fields.js
 * Full Phase 4A test suite — run: node scripts/test-dynamic-fields.js
 */

const BASE = 'http://localhost:5000/api/v1/dynamic-fields';

async function req(method, url, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

function pass(label) { console.log(`  ✅ ${label}`); }
function fail(label, detail) { console.error(`  ❌ ${label}`, detail); }
function section(title) { console.log(`\n──── ${title} ────`); }

let createdIds = [];

async function run() {
  console.log('🧪 Dynamic Field Master — Phase 4A Test Suite\n');

  // ── 1. CREATE valid fields ─────────────────────────────────────────────
  section('1. CREATE valid fields');

  const creates = [
    { fieldKey: 'employee_name',     fieldName: 'Employee Name',  fieldType: 'TEXT',     dataSource: 'EMPLOYEE' },
    { fieldKey: 'designation',       fieldName: 'Designation',    fieldType: 'TEXT',     dataSource: 'PROFILE'  },
    { fieldKey: 'joining_date',      fieldName: 'Joining Date',   fieldType: 'DATE',     dataSource: 'EMPLOYEE' },
    { fieldKey: 'salary',            fieldName: 'Salary',         fieldType: 'CURRENCY', dataSource: 'EMPLOYEE' },
    { fieldKey: 'company_gst',       fieldName: 'Company GST',    fieldType: 'TEXT',     dataSource: 'COMPANY'  },
    { fieldKey: 'is_probation',      fieldName: 'On Probation?',  fieldType: 'BOOLEAN',  dataSource: 'EMPLOYEE' },
    { fieldKey: 'contact_number',    fieldName: 'Contact Number', fieldType: 'PHONE',    dataSource: 'EMPLOYEE' },
    { fieldKey: 'official_email',    fieldName: 'Official Email', fieldType: 'EMAIL',    dataSource: 'EMPLOYEE' },
    { fieldKey: 'experience_years',  fieldName: 'Experience',     fieldType: 'NUMBER',   dataSource: 'MANUAL'   },
  ];

  for (const payload of creates) {
    const r = await req('POST', BASE, payload);
    if (r.status === 201) {
      createdIds.push(r.body.data.id);
      pass(`Created: ${payload.fieldKey} (${payload.fieldType}/${payload.dataSource}) → ID ${r.body.data.id}`);
    } else {
      fail(`Create ${payload.fieldKey}`, r.body);
    }
  }

  // ── 2. DUPLICATE field_key ─────────────────────────────────────────────
  section('2. DUPLICATE field_key (should return 409)');
  const dup = await req('POST', BASE, { fieldKey: 'employee_name', fieldName: 'Dupe', fieldType: 'TEXT', dataSource: 'MANUAL' });
  dup.status === 409 ? pass('Duplicate field_key correctly rejected with 409') : fail('Duplicate field_key not rejected', dup.body);

  // ── 3. INVALID field_type ──────────────────────────────────────────────
  section('3. INVALID field_type (should return 400)');
  const badType = await req('POST', BASE, { fieldKey: 'bad_type_field', fieldName: 'Bad', fieldType: 'textarea', dataSource: 'MANUAL' });
  badType.status === 400 ? pass('Invalid fieldType "textarea" correctly rejected with 400') : fail('Invalid fieldType not rejected', badType.body);

  // ── 4. INVALID data_source ─────────────────────────────────────────────
  section('4. INVALID data_source (should return 400)');
  const badSrc = await req('POST', BASE, { fieldKey: 'bad_source_field', fieldName: 'Bad', fieldType: 'TEXT', dataSource: 'MAGIC' });
  badSrc.status === 400 ? pass('Invalid dataSource "MAGIC" correctly rejected with 400') : fail('Invalid dataSource not rejected', badSrc.body);

  // ── 5. INVALID field_key format ────────────────────────────────────────
  section('5. INVALID field_key format (spaces not allowed)');
  const badKey = await req('POST', BASE, { fieldKey: 'my field', fieldName: 'Bad Key', fieldType: 'TEXT', dataSource: 'MANUAL' });
  badKey.status === 400 ? pass('field_key with spaces correctly rejected with 400') : fail('Invalid field_key not rejected', badKey.body);

  // ── 6. CREATE without document_type_id (should work — nullable) ────────
  section('6. CREATE without document_type_id (nullable)');
  const noDocType = await req('POST', BASE, { fieldKey: 'global_field_key', fieldName: 'Global Field', fieldType: 'TEXT', dataSource: 'SYSTEM' });
  if (noDocType.status === 201) {
    createdIds.push(noDocType.body.data.id);
    pass(`Created without documentTypeId → ID ${noDocType.body.data.id}`);
  } else {
    fail('Create without documentTypeId failed', noDocType.body);
  }

  // ── 7. GET ALL (no filters) ────────────────────────────────────────────
  section('7. GET ALL (no filters)');
  const all = await req('GET', BASE);
  all.status === 200 ? pass(`GET all returned ${all.body.data.length} records`) : fail('GET all failed', all.body);

  // ── 8. FILTER by field_type ────────────────────────────────────────────
  section('8. FILTER by field_type=DATE');
  const byType = await req('GET', `${BASE}?field_type=DATE`);
  const dateFields = byType.body?.data ?? [];
  dateFields.every(f => f.fieldType === 'DATE')
    ? pass(`filter field_type=DATE → ${dateFields.length} result(s), all correct`)
    : fail('field_type filter incorrect', byType.body);

  // ── 9. FILTER by data_source ───────────────────────────────────────────
  section('9. FILTER by data_source=EMPLOYEE');
  const bySrc = await req('GET', `${BASE}?data_source=EMPLOYEE`);
  const empFields = bySrc.body?.data ?? [];
  empFields.every(f => f.dataSource === 'EMPLOYEE')
    ? pass(`filter data_source=EMPLOYEE → ${empFields.length} result(s), all correct`)
    : fail('data_source filter incorrect', bySrc.body);

  // ── 10. FILTER by is_active ────────────────────────────────────────────
  section('10. FILTER by is_active=true');
  const byActive = await req('GET', `${BASE}?is_active=true`);
  byActive.status === 200 ? pass(`filter is_active=true → ${byActive.body.data.length} result(s)`) : fail('is_active filter failed', byActive.body);

  // ── 11. SEARCH by field_name ───────────────────────────────────────────
  section('11. SEARCH by "salary"');
  const search = await req('GET', `${BASE}?search=salary`);
  const searchHits = search.body?.data ?? [];
  searchHits.length > 0 ? pass(`search "salary" → ${searchHits.length} result(s): ${searchHits.map(f=>f.fieldKey).join(', ')}`) : fail('search returned 0 results', search.body);

  // ── 12. SEARCH by field_key ────────────────────────────────────────────
  section('12. SEARCH by field_key "designation"');
  const searchKey = await req('GET', `${BASE}?search=designation`);
  const keyHits = searchKey.body?.data ?? [];
  keyHits.length > 0 ? pass(`search "designation" → ${keyHits.length} result(s)`) : fail('field_key search returned 0 results', searchKey.body);

  // ── 13. GET by ID ──────────────────────────────────────────────────────
  section('13. GET by ID');
  if (createdIds[0]) {
    const byId = await req('GET', `${BASE}/${createdIds[0]}`);
    byId.status === 200 ? pass(`GET /${createdIds[0]} → ${byId.body.data.fieldKey}`) : fail(`GET by ID ${createdIds[0]} failed`, byId.body);
  }

  // ── 14. GET invalid ID ─────────────────────────────────────────────────
  section('14. GET invalid ID (should return 404)');
  const notFound = await req('GET', `${BASE}/99999`);
  notFound.status === 404 ? pass('GET 99999 correctly returned 404') : fail('Expected 404 for missing ID', notFound.body);

  // ── 15. UPDATE ─────────────────────────────────────────────────────────
  section('15. UPDATE field');
  if (createdIds[0]) {
    const upd = await req('PUT', `${BASE}/${createdIds[0]}`, { fieldName: 'Employee Full Name', dataSource: 'EMPLOYEE', isRequired: true });
    upd.status === 200 ? pass(`Updated ID ${createdIds[0]}: fieldName → "Employee Full Name"`) : fail('Update failed', upd.body);
  }

  // ── 16. SOFT DELETE ────────────────────────────────────────────────────
  section('16. SOFT DELETE');
  const lastId = createdIds[createdIds.length - 1];
  if (lastId) {
    const del = await req('DELETE', `${BASE}/${lastId}`, { deletedRemarks: 'Phase 4A test cleanup' });
    del.status === 200 ? pass(`Soft-deleted ID ${lastId}`) : fail(`Soft-delete ID ${lastId} failed`, del.body);

    // Verify deleted record not returned in GET ALL
    const afterDel = await req('GET', BASE);
    const found = afterDel.body?.data?.find(f => f.id === lastId);
    !found ? pass('Deleted record correctly excluded from GET ALL') : fail('Deleted record still visible in GET ALL', { lastId });
  }

  // ── 17. BULK DELETE ────────────────────────────────────────────────────
  section('17. BULK SOFT DELETE');
  if (createdIds.length >= 2) {
    const bulkIds = [createdIds[1], createdIds[2]].filter(Boolean);
    const bulk = await req('POST', `${BASE}/bulk-delete`, { ids: bulkIds, deletedRemarks: 'Phase 4A bulk cleanup' });
    bulk.status === 200 ? pass(`Bulk soft-deleted IDs: ${bulkIds.join(', ')} — affectedCount: ${bulk.body.data.affectedCount}`) : fail('Bulk delete failed', bulk.body);
  }

  console.log('\n🎉 Phase 4A test suite complete.\n');
}

run().catch(e => { console.error('Test runner crashed:', e.message); process.exit(1); });
