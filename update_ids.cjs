const fs = require('fs');
let code = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf8');
code = code.replace(
  '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 27, 29, 30, 31, 33, 34, 35, 37, 39, 41, 45, 49, 53, 57, \\'IELTS-READING-JAN2026-001\\']',
  '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 29, 30, 31, 33, 34, 35, 37, 39, 41, 45, 49, 53, 57, \\'IELTS-READING-JAN2026-001\\']'
);
fs.writeFileSync('src/pages/PracticeTests.tsx', code);
