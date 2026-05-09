const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  const form = new FormData();
  const filePath = path.join(__dirname, 'sample.pdf');
  form.append('file', fs.createReadStream(filePath));

  try {
    const response = await axios.post('http://localhost:5000/api/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Upload failed:', error.response ? error.response.data : error.message);
  }
}

testUpload();
