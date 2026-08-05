const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// The original condition: if (phase !== 'intro' && phase !== 'completed') {
// But we want it to run when phase === 'completed' as well!
// Let's just change it to if (phase !== 'intro') {
code = code.replace("if (phase !== 'intro' && phase !== 'completed') {", "if (phase !== 'intro') {");

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Patched completed condition");
