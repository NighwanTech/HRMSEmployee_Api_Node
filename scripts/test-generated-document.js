const url = 'http://localhost:5000/api/v1/generated-documents';

async function testGeneration() {
  console.log('🧪 Starting Generated Document Integration Test Suite');

  // 1. Success Generation
  console.log('\n1. Test successful document generation...');
  const res1 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId: 1,
      documentName: 'Employee Offer Letter - Kumar Adarsh',
      data: {
        employee_name: 'Kumar Adarsh',
        designation: 'Software Developer',
        joining_date: '02-Feb-2026',
        salary: '7000'
      }
    })
  });
  const data1 = await res1.json();
  console.log('Status:', res1.status);
  console.log('Body:', JSON.stringify(data1, null, 2));

  if (!data1.success) {
    console.error('❌ Failed success generation test');
    process.exit(1);
  }

  const generatedId = data1.data.id;

  // 2. Failed Generation due to missing placeholders
  console.log('\n2. Test generation failure due to missing placeholder fields...');
  const res2 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      templateId: 1,
      documentName: 'Employee Offer Letter - Missing Data',
      data: {
        employee_name: 'Kumar Adarsh',
        // designation is missing
        joining_date: '02-Feb-2026',
        salary: '7000'
      }
    })
  });
  const data2 = await res2.json();
  console.log('Status:', res2.status);
  console.log('Body:', JSON.stringify(data2, null, 2));

  // 3. GET all list
  console.log('\n3. Test GET all list...');
  const res3 = await fetch(url);
  const data3 = await res3.json();
  console.log('Status:', res3.status);
  console.log('Count:', data3.data.length);

  // 4. GET by ID
  console.log('\n4. Test GET details by ID...');
  const res4 = await fetch(`${url}/${generatedId}`);
  const data4 = await res4.json();
  console.log('Status:', res4.status);
  console.log('Document Name:', data4.data.documentName);
  console.log('Data parameters:', JSON.stringify(data4.data.generatedData));

  // 5. Soft delete
  console.log('\n5. Test soft delete...');
  const res5 = await fetch(`${url}/${generatedId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deletedRemarks: 'Clean up generated document test logs' })
  });
  const data5 = await res5.json();
  console.log('Status:', res5.status);
  console.log('Success state:', data5.success);

  // 6. Verify list exclusion
  const res6 = await fetch(url);
  const data6 = await res6.json();
  const found = data6.data.find(d => d.id === generatedId);
  console.log('Is soft deleted document excluded from list query?', !found ? 'YES ✅' : 'NO ❌');

  console.log('\n🎉 Test completed successfully.');
}

testGeneration().catch(err => {
  console.error('Crash during testing:', err);
  process.exit(1);
});
