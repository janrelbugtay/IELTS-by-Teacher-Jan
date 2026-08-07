const fs = require('fs');
let code = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');

code = code.replace("numId >= 1 && numId <= 48", "numId >= 1 && numId <= 60");

fs.writeFileSync('src/pages/TestResult.tsx', code);
