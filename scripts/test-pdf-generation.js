import fs from 'fs';
import path from 'path';

const url = 'http://localhost:5000/api/v1/generated-documents';

async function testPdfGeneration() {
  console.log('🧪 Starting Phase 5B — PDF Generation Integration Test Suite\n');

  // Test 1: Generate simple document with full valid placeholder fields
  console.log('--- Test 1: Generate Valid Document & Render PDF ---');
  const res1 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId: 1,
      documentName: 'internship-offer-letter',
      data: {
        employee_name: 'Rahul Kumar',
        designation: 'Software Engineer',
        joining_date: '01 August 2026',
        salary: '₹50,000'
      }
    })
  });
  
  const body1 = await res1.json();
  console.log('Status:', res1.status);
  console.log('Response body:', JSON.stringify(body1, null, 2));

  if (res1.status !== 201 || body1.data.status !== 'COMPLETED') {
    console.error('❌ PDF generation failed.');
    process.exit(1);
  }

  const generatedId = body1.data.id;
  const generatedPath = path.resolve(process.cwd(), body1.data.filePath.replace(/^\//, ''));
  console.log('Generated PDF path on disk:', generatedPath);
  console.log('File physically exists?', fs.existsSync(generatedPath) ? 'YES ✅' : 'NO ❌');

  // Test 2: Missing placeholders
  console.log('\n--- Test 2: Missing Placeholder Field (should return 400) ---');
  const res2 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId: 1,
      documentName: 'failed-offer-letter',
      data: {
        employee_name: 'Rahul Kumar',
        // designation missing
        joining_date: '01 August 2026',
        salary: '₹50,000'
      }
    })
  });
  console.log('Status:', res2.status);
  const body2 = await res2.json();
  console.log('Error Message:', body2.message);

  // Test 3: Download endpoint
  console.log('\n--- Test 3: Download Endpoint ---');
  const res3 = await fetch(`${url}/${generatedId}/download`);
  console.log('Status:', res3.status);
  console.log('Content-Type:', res3.headers.get('content-type'));
  console.log('Content-Disposition:', res3.headers.get('content-disposition'));

  // Test 4: Preview endpoint (inline delivery)
  console.log('\n--- Test 4: Preview Endpoint ---');
  const res4 = await fetch(`${url}/${generatedId}/preview`);
  console.log('Status:', res4.status);
  console.log('Content-Type:', res4.headers.get('content-type'));
  console.log('Content-Disposition:', res4.headers.get('content-disposition'));

  // Test 5: Regeneration
  console.log('\n--- Test 5: Regeneration ---');
  const res5 = await fetch(`${url}/${generatedId}/regenerate`, {
    method: 'POST'
  });
  console.log('Status:', res5.status);
  const body5 = await res5.json();
  console.log('Regenerated status:', body5.data.status);
  console.log('Regenerated filePath:', body5.data.filePath);

  // Clean up soft delete
  console.log('\n--- Cleanup: Soft Deleting Document Log ---');
  const res6 = await fetch(`${url}/${generatedId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deletedRemarks: 'Automated test suite cleanup' })
  });
  console.log('Status:', res6.status);
  console.log('Cleaned up successfully ✅');

  console.log('\n🎉 Phase 5B Test Suite Completed.');
}

testPdfGeneration().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});
