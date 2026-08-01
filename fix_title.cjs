const fs = require('fs');

const path = 'src/pages/ComputerReadingTest.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  "if (monthIndex >= 0 && monthIndex < months.length) {",
  "if (monthIndex >= 0) {"
);
fs.writeFileSync(path, content);
