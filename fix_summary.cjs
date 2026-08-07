const fs = require('fs');
let code = fs.readFileSync('src/data/test16ReadingData.ts', 'utf8');

code = code.replace(
  /instruction:\s*"([^"]+)\\n\\nThe Tasmanian tiger,([^"]+)"/,
  'instruction: "$1",\n        text: "The Tasmanian tiger,$2"'
);

fs.writeFileSync('src/data/test16ReadingData.ts', code);
console.log("Fixed summary text again");
