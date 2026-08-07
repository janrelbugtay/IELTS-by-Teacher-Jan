const fs = require('fs');

let content = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf8');

content = content.replace(/33, 34, 35, 37, 41/, "33, 34, 35, 37, 39, 41");

fs.writeFileSync('src/pages/PracticeTests.tsx', content);
console.log('Added 39 to PracticeTests');
