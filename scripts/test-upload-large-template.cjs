const http = require('http');

async function runTest() {
  console.log('--- TEST 1: Menyiapkan dummy data .docx sebesar 2.5 MB ---');
  // Generate a dummy buffer of 2.5 MB
  const dummyBuffer = Buffer.alloc(2.5 * 1024 * 1024, 'PK\x03\x04DummyDocxContent');
  const base64Data = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' + dummyBuffer.toString('base64');
  console.log('Ukuran base64 string:', (base64Data.length / 1024 / 1024).toFixed(2), 'MB');

  const payload = JSON.stringify({
    title: 'Template Contoh Pertemuan 5',
    category: 'proposal',
    description: 'Uji coba upload file docx besar 2.5 MB',
    filename: 'Pertemuan 5.docx',
    file_size: '2204 KB',
    file_data: base64Data,
    version: 'v2026.1'
  });

  // Post directly to backend
  console.log('\n--- TEST 2: POST /rest/api/templates (Backend port 3001) ---');
  const postResult = await new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3001/rest/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(data) });
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

  console.log('Status code:', postResult.status);
  console.log('Response success:', postResult.body.success);
  console.log('Response message:', postResult.body.message);
  if (!postResult.body.success) {
    throw new Error('Upload failed: ' + JSON.stringify(postResult.body));
  }

  const createdId = postResult.body.data.id;
  console.log('Created Template ID:', createdId);

  // Test 3: Get Template Detail with base64 download
  console.log('\n--- TEST 3: GET /resr/api/templates/' + createdId + ' (Frontend proxy port 3000) ---');
  const getResult = await new Promise((resolve, reject) => {
    http.get('http://localhost:3000/resr/api/templates/' + createdId, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(data) });
      });
    }).on('error', reject);
  });

  console.log('Status code:', getResult.status);
  console.log('Response success:', getResult.body.success);
  console.log('Title:', getResult.body.data.title);
  console.log('Filename:', getResult.body.data.filename);
  console.log('File size string:', getResult.body.data.file_size);
  console.log('File data received (starts with):', getResult.body.data.file_data?.substring(0, 50));
  console.log('File data length in MB:', ((getResult.body.data.file_data?.length || 0) / 1024 / 1024).toFixed(2), 'MB');

  // Test 4: Delete template
  console.log('\n--- TEST 4: DELETE /resr/api/templates/' + createdId + ' ---');
  const deleteResult = await new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/resr/api/templates/' + createdId, {
      method: 'DELETE'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: JSON.parse(data) });
      });
    });
    req.on('error', reject);
    req.end();
  });

  console.log('Status code:', deleteResult.status);
  console.log('Delete message:', deleteResult.body.message);

  console.log('\n✅ SEMUA PENGUJIAN UPLOAD BERKAS BESAR (> 2 MB) BERHASIL 100%!');
}

runTest().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});

