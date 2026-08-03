import fs from 'fs';
import path from 'path';
import { DynamicField } from '../src/modules/dynamicField/dynamicField.model.js';
import { TemplateContent } from '../src/modules/templateContent/templateContent.model.js';
import { Company } from '../src/modules/company/company.model.js';

const BASE = 'http://localhost:5000/api/v1/generated-documents';
const RESOLVE_URL = 'http://localhost:5000/api/v1/generated-documents/resolve-data';

async function testResolutionSuite() {
  console.log('🧪 Phase 5D — Dynamic Data Resolver & Auto-Fill Integration Test Suite\n');

  // Save original dynamic fields state
  console.log('🔧 Setting up database states for testing...');
  const originalEmployeeName = await DynamicField.findOne({ where: { fieldKey: 'employee_name' } });
  if (originalEmployeeName) {
    await originalEmployeeName.update({ isRequired: true });
    console.log('   Mapped employee_name to isRequired = true');
  }

  const company1 = await Company.findByPk(1);
  let originalGst = null;
  if (company1) {
    originalGst = company1.gstNumber;
    await company1.update({ gstNumber: '22AAAAA0000A1Z5' });
    console.log('   Set company 1 gstNumber to 22AAAAA0000A1Z5');
  }

  const originalContent = await TemplateContent.findOne({ where: { templateId: 1 } });
  const savedContent = originalContent ? originalContent.content : '';

  // Create temporary SYSTEM and MANUAL fields
  console.log('   Creating temporary SYSTEM and MANUAL fields for testing...');
  await DynamicField.destroy({ where: { fieldKey: ['current_date', 'current_year', 'custom_bonus'] }, force: true });
  await DynamicField.bulkCreate([
    { fieldKey: 'current_date', fieldName: 'Current Date', fieldType: 'DATE', dataSource: 'SYSTEM', isRequired: false, isActive: true },
    { fieldKey: 'current_year', fieldName: 'Current Year', fieldType: 'TEXT', dataSource: 'SYSTEM', isRequired: false, isActive: true },
    { fieldKey: 'custom_bonus', fieldName: 'Custom Bonus', fieldType: 'NUMBER', dataSource: 'MANUAL', isRequired: false, isActive: true }
  ]);

  try {
    // ── Test 1 & 2: Success Resolution with EMPLOYEE & SYSTEM ───────────────────────
    console.log('\n--- Test 1 & 2: Resolve Valid Template ID 1 Data ---');
    const res1 = await fetch(RESOLVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 1,
        employeeId: 12,
        companyId: 1,
        profileId: 1,
        manualData: {
          custom_bonus: '15000'
        }
      })
    });

    const body1 = await res1.json();
    console.log('Status:', res1.status);
    console.log('Resolved Value (employee_name):', body1.data.resolvedData.employee_name);
    console.log('Resolved Value (designation):', body1.data.resolvedData.designation);
    console.log('Resolved Value (joining_date):', body1.data.resolvedData.joining_date);
    console.log('Resolved Value (salary):', body1.data.resolvedData.salary);

    if (res1.status !== 200 || body1.data.resolvedData.employee_name !== 'Rahul Kumar') {
      throw new Error('Resolution test failed.');
    }
    console.log('✅ Success resolution verified.');

    // ── Test 3: COMPANY Resolution ──────────────────────────────────────────────
    console.log('\n--- Test 3: COMPANY Resolution ---');
    // Let's add company_gst to the template content temporarily to verify it resolves
    await originalContent.update({
      content: savedContent + '<p>Company GST: {{company_gst}}</p>'
    });
    console.log('   Added {{company_gst}} to template layout.');

    const res3Company = await fetch(RESOLVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 1,
        employeeId: 12,
        companyId: 1,
        profileId: 1
      })
    });
    const body3Company = await res3Company.json();
    console.log('Status:', res3Company.status);
    console.log('company_gst resolved:', body3Company.data.resolvedData.company_gst);
    if (!body3Company.data.resolvedData.company_gst) {
      throw new Error('company_gst failed to resolve.');
    }
    console.log('✅ Company resolver configuration verified.');

    // Restore template layout
    await originalContent.update({ content: savedContent });

    // ── Test 4: PROFILE Resolution ─────────────────────────────────────────────
    console.log('\n--- Test 4: PROFILE Resolution ---');
    console.log('designation resolved from profile ID 1:', body1.data.resolvedData.designation);
    if (!body1.data.resolvedData.designation) {
      throw new Error('designation failed to resolve.');
    }
    console.log('✅ Profile resolver configuration verified.');

    // ── Test 5: SYSTEM Resolution ──────────────────────────────────────────────
    console.log('\n--- Test 5: SYSTEM Resolution (Server-Side) ---');
    // Set template to use current_date system placeholder
    await originalContent.update({
      content: savedContent + '<p>Date: {{current_date}} Year: {{current_year}}</p>'
    });
    const res5System = await fetch(RESOLVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 1,
        employeeId: 12,
        companyId: 1,
        profileId: 1
      })
    });
    const body5System = await res5System.json();
    console.log('Status:', res5System.status);
    console.log('current_date resolved:', body5System.data.resolvedData.current_date);
    console.log('current_year resolved:', body5System.data.resolvedData.current_year);
    if (!body5System.data.resolvedData.current_date || !body5System.data.resolvedData.current_year) {
      throw new Error('SYSTEM placeholders failed to resolve.');
    }
    console.log('✅ System properties resolved correctly.');
    
    // Restore template layout
    await originalContent.update({ content: savedContent });

    // ── Test 6: MANUAL Resolution ──────────────────────────────────────────────
    console.log('\n--- Test 6: MANUAL Resolution ---');
    await originalContent.update({
      content: savedContent + '<p>Bonus: {{custom_bonus}}</p>'
    });
    const res6Manual = await fetch(RESOLVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 1,
        employeeId: 12,
        companyId: 1,
        profileId: 1,
        manualData: {
          custom_bonus: '15000'
        }
      })
    });
    const body6Manual = await res6Manual.json();
    console.log('manualData bonus resolved:', body6Manual.data.resolvedData.custom_bonus === '15000' ? 'YES ✅' : 'NO ❌');
    if (body6Manual.data.resolvedData.custom_bonus !== '15000') {
      throw new Error('manualData failed to resolve.');
    }
    
    // Restore template layout
    await originalContent.update({ content: savedContent });

    // ── Test 7: Missing Required Field (should return 400) ───────────────────────
    console.log('\n--- Test 7: Missing Required Field ---');
    console.log('Simulating missing context by omitting employeeId for template containing employee fields...');
    const res2 = await fetch(RESOLVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 1,
        // employeeId omitted
        companyId: 1,
        profileId: 1
      })
    });
    const body2 = await res2.json();
    console.log('Status (expected 400):', res2.status);
    console.log('Error Message:', body2.message);
    console.log('Missing fields reported:', body2.data ? body2.data.missingFields : 'none');
    if (res2.status !== 400 || !body2.data.missingFields.includes('employee_name')) {
      throw new Error('Failed Test 7: Missing required field error not raised correctly.');
    }
    console.log('✅ Missing required fields test passed.');

    // ── Test 8: Undefined Placeholder (should return 400) ────────────────────────
    console.log('\n--- Test 8: Undefined Placeholder Configuration ---');
    // Temporarily insert bad placeholder in template content
    await originalContent.update({
      content: savedContent + '<p>Bad Placeholder: {{unknown_field}}</p>'
    });
    console.log('   Injected {{unknown_field}} placeholder.');

    const res8Undefined = await fetch(RESOLVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 1,
        employeeId: 12,
        companyId: 1,
        profileId: 1
      })
    });
    const body8Undefined = await res8Undefined.json();
    console.log('Status (expected 400):', res8Undefined.status);
    console.log('Error Message (expected: template contains undefined dynamic field):', body8Undefined.message);
    if (res8Undefined.status !== 400 || !body8Undefined.message.includes('unknown_field')) {
      throw new Error('Failed Test 8: Undefined placeholder config error not raised correctly.');
    }
    console.log('✅ Configuration error checks passed.');

    // Restore template layout
    await originalContent.update({ content: savedContent });

    // ── Test 9: Complete Document Generation with Auto-Fill ─────────────────────
    console.log('\n--- Test 9: Document Generation with Auto-Fill ---');
    const res3 = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: 1,
        documentName: 'Auto-Filled-Offer-Letter',
        employeeId: 12,
        companyId: 1,
        profileId: 1,
        data: {
          custom_bonus: '12000'
        }
      })
    });
    const body3 = await res3.json();
    console.log('Status (expected 201):', res3.status);
    console.log('Generated status:', body3.data.status);
    console.log('Generated filePath:', body3.data.filePath);

    if (res3.status !== 201 || body3.data.status !== 'COMPLETED') {
      throw new Error('❌ Document generation failed.');
    }
    const generatedId = body3.data.id;
    console.log('✅ Auto-fill generation verified successfully.');

    // ── Test 10: Regeneration using saved generatedData ───────────────────────
    console.log('\n--- Test 10: Overwrite Regeneration ---');
    const res4 = await fetch(`${BASE}/${generatedId}/regenerate`, {
      method: 'POST'
    });
    const body4 = await res4.json();
    console.log('Status (expected 200):', res4.status);
    console.log('Regenerated status:', body4.data.status);
    console.log('Regenerated filePath:', body4.data.filePath);

    if (res4.status !== 200 || body4.data.status !== 'COMPLETED') {
      throw new Error('❌ Regeneration failed.');
    }
    console.log('✅ Regeneration verified successfully.');

    // ── Cleanup: soft delete ───────────────────────────────────────────────────
    console.log('\n--- Cleanup: Soft Deleting Test Document ---');
    const res5 = await fetch(`${BASE}/${generatedId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deletedRemarks: 'Clean up Phase 5D auto-fill test log' })
    });
    console.log('Status:', res5.status);
    console.log('Cleaned up successfully ✅');

  } finally {
    // ── Post Test Cleanup ──────────────────────────────────────────────────────
    console.log('\n🧹 Cleaning up database states...');
    await DynamicField.destroy({ where: { fieldKey: ['current_date', 'current_year', 'custom_bonus'] }, force: true });
    console.log('   Removed temporary SYSTEM and MANUAL fields');
    if (originalEmployeeName) {
      await originalEmployeeName.update({ isRequired: false });
      console.log('   Reverted employee_name to isRequired = false');
    }
    if (company1) {
      await company1.update({ gstNumber: originalGst });
      console.log('   Reverted company 1 gstNumber');
    }
    if (originalContent) {
      await originalContent.update({ content: savedContent });
      console.log('   Reverted template content to original content');
    }
  }

  console.log('\n🎉 Phase 5D Test Suite Completed.');
}

testResolutionSuite().catch(err => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
export const run = null;
