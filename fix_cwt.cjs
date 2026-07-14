const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');
const target = `    if (id === '11' && !submissionId) {
        return <MarchWritingTest />;
    }`;
const replacement = `    if (id === '11' && !submissionId) {
        return <MarchWritingTest />;
    }
    if (id === '15' && !submissionId) {
        return <AprilWritingTest />;
    }`;
if(code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/pages/ComputerWritingTest.tsx', code);
    console.log("Fixed!");
} else {
    console.log("Target not found!");
}
