const fs = require('fs');
let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');

// Replace all unescaped newlines inside explanation strings.
// A better way is to use template literals for the explanation string, or properly escape them.
code = code.replace(/explanation: "([^"]*)"/g, (match, p1) => {
  return 'explanation: `' + p1 + '`';
});

fs.writeFileSync('src/data/decemberReadingData.ts', code);
