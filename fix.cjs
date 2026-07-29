const fs = require('fs');
let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');
code = code.replace(/  \}\},\n  "14": \{/g, '  },\n  "14": {');
code = code.replace(/  \}\},  "14": \{/g, '  },  "14": {');
code = code.replace(/\},\s*"14": \{/g, '},\n  "14": {');
fs.writeFileSync('src/data/decemberReadingData.ts', code);
