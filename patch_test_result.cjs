const fs = require('fs');
let code = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');

code = code.replace(
  "    if (numId % 4 === 0) skill = 'Speaking';\\n    return \\\`\\${month} \\${skill} Practice (IELTS)\\\`;",
  "    if (numId % 4 === 0) skill = 'Speaking';\\n    if (skill === 'Speaking') return \\\`Online Speaking Test \\${Math.ceil(numId / 4)}\\\`;\\n    return \\\`\\${month} \\${skill} Practice (IELTS)\\\`;"
);

fs.writeFileSync('src/pages/TestResult.tsx', code);
