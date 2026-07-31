const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

code = code.replace(
  'No speaking practice tests yet.',
  'No online speaking tests yet.'
);

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
