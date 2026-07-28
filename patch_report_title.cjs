const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

code = code.replace(
  "const formattedId = testId ? testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';",
  "const formattedId = testId ? (testId.includes('Practice') ? testId : testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) : '';"
);

code = code.replace(
  "const title = customTitle || (formattedId ? \`\${formattedId} Speaking Practice\` : 'Speaking Practice');",
  "const title = customTitle || (testId && testId.includes('Practice') ? testId : (formattedId ? \`\${formattedId} Speaking Practice\` : 'Speaking Practice'));"
);

fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
