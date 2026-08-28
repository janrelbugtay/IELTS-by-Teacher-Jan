const fs = require('fs');

const content = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf8');

const replacement = content.replace(
  /65:\s*\['Passage 1',\s*'Making Documentary Films',\s*'Passage 3'\],/,
  "65: ['Rural transport plan of “Practical action”', 'Making Documentary Films', 'Passage 3'],"
);

fs.writeFileSync('src/pages/PracticeTests.tsx', replacement);
console.log('patched tests list');
