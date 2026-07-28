const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');
code = code.replace(
  "const title = testId ? `${testId.charAt(0).toUpperCase() + testId.slice(1)} Performance Report` : 'Performance Report';",
  "const formattedId = testId ? testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';\n  const title = formattedId ? `${formattedId} Performance Report` : 'Performance Report';"
);
fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
