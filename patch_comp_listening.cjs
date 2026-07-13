const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src/pages/ComputerListeningTest.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the "Coming Soon" block for id === '2'
content = content.replace(
    /if \(id === '2' && !submissionId\) {[\s\S]*?className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">\s*<ArrowLeft className="w-5 h-5" \/>\s*Go Back\s*<\/button>\s*<\/div>\s*<\/div>\s*\);\s*}/g,
    "if (id === '2' && !submissionId) return <JanuaryListeningTest />;"
);

// We can also remove `if (id === '15')` since '2' is the actual ID, but let's just make both '2' and '15' return JanuaryListeningTest to be safe.
fs.writeFileSync(filePath, content);
