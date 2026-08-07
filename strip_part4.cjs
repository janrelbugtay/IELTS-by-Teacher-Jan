const fs = require('fs');

let content = fs.readFileSync('src/pages/OctoberListeningTest.tsx', 'utf8');

const startStr = "currentPartIndex === 4";

const startIndex = content.indexOf(startStr);
console.log(startIndex);
