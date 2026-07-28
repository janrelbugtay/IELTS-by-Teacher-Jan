const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace('"gemini-3.1-flash-live-preview"', '"gemini-2.0-flash-exp"');
fs.writeFileSync('server.ts', content);
console.log('Fixed model name');
