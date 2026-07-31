const fs = require('fs');
let code = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf8');

code = code.replace(
  "`${month} ${skill.name} Practice (${courseName})`",
  "skill.name === 'Speaking' && courseName === 'IELTS' ? `Online Speaking Test ${mIndex + 1}` : `${month} ${skill.name} Practice (${courseName})`"
);

fs.writeFileSync('src/pages/PracticeTests.tsx', code);
