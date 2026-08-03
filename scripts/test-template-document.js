import fs from 'fs';
import path from 'path';

// Target URL
const uploadUrl = 'http://localhost:5000/api/v1/template-documents/upload';
const checkUrl = 'http://localhost:5000/api/v1/template-documents';

// Path to a sample PDF found on disk
const pdfPath = 'C:\\Users\\krada\\OneDrive\\Desktop\\docgen backend\\uploads\\pdfs\\template-1785671539364-21823007.pdf';

async function testSuite() {
  console.log('🧪 Starting Template Document Integration Test Suite');

  if (!fs.existsSync(pdfPath)) {
    console.error('❌ Sample PDF not found. Test aborted.');
    process.exit(1);
  }

  // Create multipart/form-data payload manually
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileData = fs.readFileSync(pdfPath);
  const fileName = path.basename(pdfPath);

  const payloadHeader = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="template_id"',
    '',
    '1',
    `--${boundary}`,
    `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
    'Content-Type: application/pdf',
    '',
    ''
  ].join('\r\n');

  const payloadFooter = `\r\n--${boundary}--\r\n`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(payloadHeader, 'utf-8'),
    fileData,
    Buffer.from(payloadFooter, 'utf-8')
  ]);

  console.log(`📤 Uploading PDF [${fileName}] to Template ID 1...`);
  
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body: bodyBuffer
  });

  const uploadResult = await uploadResponse.json();
  console.log('Response Status:', uploadResponse.status);
  console.log('Upload Result:', JSON.stringify(uploadResult, null, 2));

  if (!uploadResult.success) {
    console.error('❌ Upload failed.');
    process.exit(1);
  }

  const docId = uploadResult.data.id;

  // Let conversion complete in background (wait 3 seconds)
  console.log('🕒 Waiting 3 seconds for background conversion to run...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Retrieve details
  console.log(`📥 Fetching details for document ID: ${docId}...`);
  const detailsResponse = await fetch(`${checkUrl}/${docId}`);
  const detailsResult = await detailsResponse.json();
  console.log('Details Result Status:', detailsResponse.status);
  console.log('Details Result Status Field:', detailsResult.data.status);
  console.log('Details Page Count:', detailsResult.data.pageCount);
  console.log('Details Converted Content Sample (150 chars):', (detailsResult.data.convertedContent || '').substring(0, 150));

  // Serve original document download test
  console.log(`📥 Downloading original uploaded file via endpoint...`);
  const downloadResponse = await fetch(`${checkUrl}/${docId}/original`);
  console.log('Download Response Status:', downloadResponse.status);
  console.log('Download Response Headers Content-Type:', downloadResponse.headers.get('content-type'));

  // Cleanup with soft delete
  console.log(`🗑️ Soft deleting document ID: ${docId}...`);
  const deleteResponse = await fetch(`${checkUrl}/${docId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deletedRemarks: 'Automated test suite cleanup' })
  });
  const deleteResult = await deleteResponse.json();
  console.log('Delete Result Success:', deleteResult.success);

  // Retrieve templates list to verify soft delete
  console.log(`📥 Verifying document exclusion in list after deletion...`);
  const listResponse = await fetch(`${checkUrl}/template/1`);
  const listResult = await listResponse.json();
  const found = listResult.data.find(d => d.id === docId);
  console.log('Is deleted document excluded from list?', !found ? 'YES ✅' : 'NO ❌');

  console.log('🎉 Testing finished.');
}

testSuite().catch(err => {
  console.error('Crash during testing:', err);
  process.exit(1);
});
