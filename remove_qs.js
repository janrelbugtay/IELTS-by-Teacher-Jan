const fs = require('fs');
let data = fs.readFileSync('src/data/septemberReadingData.ts', 'utf8');

data = data.replace(/type: "flowchart-september",\s*questions: \[\s*\{\s*id: 7, text: "7"\s*\},\s*\{\s*id: 8, text: "8"\s*\},\s*\{\s*id: 9, text: "9"\s*\},\s*\{\s*id: 10, text: "10"\s*\}\s*\]/, 'type: "flowchart-september"');

fs.writeFileSync('src/data/septemberReadingData.ts', data);
