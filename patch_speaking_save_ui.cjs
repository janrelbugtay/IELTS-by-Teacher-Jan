const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

code = code.replace(/\{isSaving && \([\s\S]*?\}\)/, '');

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
