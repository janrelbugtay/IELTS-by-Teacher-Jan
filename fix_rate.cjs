const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

code = code.replace(
    'const utterance = new SpeechSynthesisUtterance(text);\n          utterance.rate = 0.9;',
    'const utterance = new SpeechSynthesisUtterance(text);\n          utterance.rate = 0.95;'
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Replaced successfully");
