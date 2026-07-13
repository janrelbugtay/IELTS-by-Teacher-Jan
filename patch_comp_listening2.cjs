const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/pages/ComputerListeningTest.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the "Coming Soon" block for id === '2'
content = content.replace(
    /if \(id === '2' && !submissionId\) {[\s\S]*?Back to Dashboard\s*<\/button>\s*<\/div>\s*<\/div>\s*\);\s*}/g,
    "if (id === '2' && !submissionId) return <JanuaryListeningTest />;"
);

fs.writeFileSync(filePath, content);
