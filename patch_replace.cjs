const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

content = content.replace(
    /const correctAns = \(currentAnswerKey as any\)\[qId\]\.replace\('\/', ' or '\);/g,
    "const correctAns = ((currentAnswerKey as any)[qId] || '').toString().replace('/', ' or ');"
);

content = content.replace(
    /\{\(currentAnswerKey as any\)\[qNum\]\.replace\('\/', ' or '\)\}/g,
    "{((currentAnswerKey as any)[qNum] || '').toString().replace('/', ' or ')}"
);

content = content.replace(
    /\{p\.title\.replace\('READING ', ''\)\}/g,
    "{(p.title || '').replace('READING ', '')}"
);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', content);
console.log('patched ComputerReadingTest.tsx');
