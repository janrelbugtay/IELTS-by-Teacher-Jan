const fs = require('fs');
let code = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

code = code.replace(
    /"Let's talk about your hometown\. Where is your hometown\?"/,
    '"Where is your hometown?"'
);

fs.writeFileSync('src/data/speakingTestData.ts', code);
console.log("Patched fallback repeating intro phrases");
