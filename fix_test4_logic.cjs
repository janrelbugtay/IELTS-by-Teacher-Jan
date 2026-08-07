const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

code = code.replace(/testNum === '3'/g, "(testNum === '3' || testNum === '4')");
code = code.replace(/testNum !== '3'/g, "(testNum !== '3' && testNum !== '4')");

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
