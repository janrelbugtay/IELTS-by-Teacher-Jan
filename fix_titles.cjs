const fs = require('fs');
let code = fs.readFileSync('src/data/test16ReadingData.ts', 'utf8');

code = code.replace(/title:\s*"Questions 24-26"/, 'title: "Question 24"');
code = code.replace(/title:\s*"Questions 33-36"/, 'title: "Question 33"');

fs.writeFileSync('src/data/test16ReadingData.ts', code);
console.log("Fixed titles");
