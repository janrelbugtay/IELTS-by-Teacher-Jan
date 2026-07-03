const fs = require('fs');
let code = fs.readFileSync('src/data/readingTestData.ts', 'utf-8');
code = code.replace(/id === '4'/g, "id === '5'");
code = code.replace(/id === '7'/g, "id === '9'");
code = code.replace(/id === '10'/g, "id === '13'");
code = code.replace(/id === '13'/g, "id === '17'");
fs.writeFileSync('src/data/readingTestData.ts', code);
