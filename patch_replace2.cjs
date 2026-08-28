const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

content = content.replace(
    /const escapeRegExp = \(string: string\) => string.replace/g,
    "const escapeRegExp = (string: string) => (string || '').replace"
);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', content);
console.log('patched escapeRegExp');
