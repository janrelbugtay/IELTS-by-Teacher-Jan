const https = require('https');
https.get('https://drive.google.com/uc?export=download&id=1OuGcq0z6bZ28Uv0nKogXeu40tEZTD5Jl', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
});
