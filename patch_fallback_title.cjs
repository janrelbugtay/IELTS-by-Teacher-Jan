const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

code = code.replace(
  "    if (numId % 4 === 0) skill = 'Speaking';\\n    return \\\`\\${month} \\${skill} Practice\\\`;",
  "    if (numId % 4 === 0) skill = 'Speaking';\\n    if (skill === 'Speaking') return \\\`Online Speaking Test \\${Math.ceil(numId / 4)}\\\`;\\n    return \\\`\\${month} \\${skill} Practice\\\`;"
);

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
