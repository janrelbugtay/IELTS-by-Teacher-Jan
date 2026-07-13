const fs = require('fs');

let cw = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');
cw = cw.replace(/if \(id === '14'\)/g, "if (id === '15' && !submissionId)");
cw = cw.replace(/if \(id === '11'\)/g, "if (id === '11' && !submissionId)");
fs.writeFileSync('src/pages/ComputerWritingTest.tsx', cw);

let cl = fs.readFileSync('src/pages/ComputerListeningTest.tsx', 'utf8');
// make sure MayListeningTest is correctly loaded for id 18
// I see: if (id === '18' && !submissionId) return <MayListeningTest />; which is correct
// Let's remove the spurious mapping for id 15 to JanuaryListeningTest
cl = cl.replace("if (id === '15' && !submissionId) return <JanuaryListeningTest />;\n", "");
fs.writeFileSync('src/pages/ComputerListeningTest.tsx', cl);

console.log("Fixed routing in ComputerWritingTest and ComputerListeningTest");
