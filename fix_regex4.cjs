const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

// Also remove font-bold from optionLines, we already did
// Let's hardcode text-black just in case
content = content.replace(
  /className=\{\`mt-4 font-sans not-italic text-\[1\.25em\] \$\{colorTheme !== 'standard' \? 'text-white' : 'text-black'\}\`\}/g,
  "className={`mt-4 font-sans not-italic text-[1.25em] text-black`}"
);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', content);
