const fs = require('fs');
let data = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

// Replace the hardcoded question lengths in the navigation box
data = data.replace(
  /\{Array\.from\(\{ length: 13 \}, \(_, i\) => i \+ 1\)\.map\(renderQuestionBox\(0\)\)\}/g,
  '{Array.from({ length: 13 }, (_, i) => i + 1).map(renderQuestionBox(0))}'
);

data = data.replace(
  /\{Array\.from\(\{ length: 13 \}, \(_, i\) => i \+ 14\)\.map\(renderQuestionBox\(1\)\)\}/g,
  '{Array.from({ length: 13 }, (_, i) => i + 14).map(renderQuestionBox(1))}'
);

data = data.replace(
  /\{Array\.from\(\{ length: 14 \}, \(_, i\) => i \+ 27\)\.map\(renderQuestionBox\(2\)\)\}/g,
  '{Array.from({ length: 14 }, (_, i) => i + 27).map(renderQuestionBox(2))}'
);


fs.writeFileSync('src/pages/ComputerReadingTest.tsx', data);
