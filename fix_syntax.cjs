const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const targetStart = `            return (
              <span 
                 key={i} `;

const replacementStart = `            return (
              <React.Fragment key={i}>
              <span 
                 id={\`question-\${qId}\`} `; // Note: I should be careful not to remove too much.

// Let's use regex instead:
content = content.replace(
  /return \(\s*<span \s*key=\{i\} \s*id={`question-\${qId}`}/,
  'return (\n              <React.Fragment key={i}>\n              <span \n                 id={`question-${qId}`}'
);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', content);
