const fs = require('fs');
let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');

// The file currently has:
//   "13": {
//     ...
//   }
// },
//   "14": {
//     ...
//   }
// };
// We want to remove the `},` before "14" and make it `, "14"`.

code = code.replace(/\}\s*\}\s*,\s*"14": \{/g, '  },\n  "14": {');
code = code.replace(/\}\s*,\s*"14": \{/g, '  },\n  "14": {');
fs.writeFileSync('src/data/decemberReadingData.ts', code);
