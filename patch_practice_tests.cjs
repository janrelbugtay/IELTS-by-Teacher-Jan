const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/PracticeTests.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "[1, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 17, 21, 'IELTS-READING-JAN2026-001']",
    "[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 17, 21, 'IELTS-READING-JAN2026-001']"
);

fs.writeFileSync(file, content);
