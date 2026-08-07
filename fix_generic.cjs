const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Replace `if ((testNum === '3' || testNum === '4')) {` with `if (true) {`
code = code.replace(/if \(\(testNum === '3' \|\| testNum === '4'\)\) \{/g, "if (true) {");

// Replace `(testNum === '3' || testNum === '4') && !isPrepTimerRunning` with `!isPrepTimerRunning`
code = code.replace(/\(testNum === '3' \|\| testNum === '4'\) && !isPrepTimerRunning/g, "!isPrepTimerRunning");

// Replace `{(testNum === '3' || testNum === '4') && (` with `{true && (`
code = code.replace(/\{\(testNum === '3' \|\| testNum === '4'\) && \(/g, "{true && (");

// Replace `if ((testNum !== '3' && testNum !== '4') || isPrepTimerRunning) {` with `if (isPrepTimerRunning) {`
code = code.replace(/if \(\(testNum !== '3' && testNum !== '4'\) \|\| isPrepTimerRunning\) \{/g, "if (isPrepTimerRunning) {");

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
