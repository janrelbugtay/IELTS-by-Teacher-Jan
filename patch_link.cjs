const fs = require('fs');
let code = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf-8');
code = code.replace(
  /\{\[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 17, 18\]\.includes\(test\.id\) \? \(/,
  "{[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 17, 18, 'IELTS-READING-JAN2026-001'].includes(test.id) ? ("
);
fs.writeFileSync('src/pages/PracticeTests.tsx', code);
