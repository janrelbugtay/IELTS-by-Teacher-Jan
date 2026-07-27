const fs = require('fs');
let data = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf8');

data = data.replace(
    /\[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 27, 29, 33, 37, 'IELTS-READING-JAN2026-001'\]/g,
    "[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 27, 29, 33, 37, 41, 'IELTS-READING-JAN2026-001']"
);

fs.writeFileSync('src/pages/PracticeTests.tsx', data);
console.log('Fixed PracticeTests');
