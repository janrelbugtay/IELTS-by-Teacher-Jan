const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

// Replace standard tables with scrollable ones for the overview section
code = code.replaceAll('<div className="overflow-x-auto">', '<div className="overflow-x-auto overflow-y-auto max-h-[400px]">');
code = code.replaceAll('<thead', '<thead className="sticky top-0 z-10 bg-slate-50"');

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
