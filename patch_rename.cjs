const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

code = code.replace(
  '<Mic className="w-6 h-6 text-purple-600" /> Speaking Practice Tests',
  '<Mic className="w-6 h-6 text-purple-600" /> Online Speaking Tests'
);

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
