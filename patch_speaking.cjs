const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

code = code.replace(
  "const assignmentTitle = \`January Speaking Practice\`;",
  "const assignmentTitle = \`Online Speaking Test \${testNum}\`;"
);

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
