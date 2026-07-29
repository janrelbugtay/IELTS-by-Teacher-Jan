const fs = require('fs');
let code = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf8');
code = code.replace(
    /\[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 27, 29, 33, 37, 41, 'IELTS-READING-JAN2026-001'\]/g,
    "[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 27, 29, 33, 37, 41, 45, 'IELTS-READING-JAN2026-001']"
);
fs.writeFileSync('src/pages/PracticeTests.tsx', code);
console.log("Patched!");
