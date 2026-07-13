const fs = require('fs');
const content = fs.readFileSync('src/pages/JanuaryListeningTest.tsx', 'utf8');

const lines = content.split('\n');
let depth = 0;
let started = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('return (')) {
        started = true;
    }
    if (!started) continue;
    
    // Naive count for simple cases
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    
    depth += opens;
    depth -= closes;
    
    if (depth < 0) {
        console.log(`Depth became negative at line ${i + 1}: ${line}`);
        break;
    }
    if (depth === 0 && started && i > 497) {
        console.log(`Depth reached 0 at line ${i + 1}: ${line}`);
        // Let's print the next few lines
        for (let j = 1; j <= 5; j++) {
           if (lines[i+j]) console.log(`   ${i+1+j}: ${lines[i+j]}`);
        }
        break;
    }
}
