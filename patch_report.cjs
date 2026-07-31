const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

code = code.replace(
  "const formattedId = testId ? (testId.includes('Practice') ? testId : testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) : '';",
  "const formattedId = testId ? (testId.includes('Test') || testId.includes('Practice') ? testId : testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) : '';"
);

code = code.replace(
  "const title = customTitle || (testId && testId.includes('Practice') ? testId : (formattedId ? \`\${formattedId} Speaking Practice\` : 'Speaking Practice'));",
  "const title = customTitle || (testId && (testId.includes('Practice') || testId.includes('Test')) ? testId : (!isNaN(parseInt(testId)) ? \`Online Speaking Test \${testId}\` : (formattedId ? \`\${formattedId} Online Speaking Test\` : 'Online Speaking Test')));"
);

fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
