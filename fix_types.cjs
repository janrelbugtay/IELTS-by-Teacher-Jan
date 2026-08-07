const fs = require('fs');
let code = fs.readFileSync('src/data/test16ReadingData.ts', 'utf8');

code = code.replace(/type:\s*"true-false"/g, 'type: "choice"');
code = code.replace(/type:\s*"multiple-choice"/g, 'type: "mcq"');
code = code.replace(/type:\s*"summary-completion"/g, 'type: "summary-input"');
code = code.replace(/type:\s*"yes-no"/g, 'type: "choice"');

fs.writeFileSync('src/data/test16ReadingData.ts', code);
console.log("Fixed types");
