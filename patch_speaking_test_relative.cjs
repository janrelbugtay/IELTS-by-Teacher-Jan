const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

code = code.replace(
  'className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto"',
  'className="relative flex-1 flex flex-col p-4 md:p-8 overflow-y-auto"'
);

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
