const fs = require('fs');

const content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const startIndex = content.indexOf("{block.instruction.split('\\n').map((line: string, idx: number) => {");
if (startIndex !== -1) {
  console.log("Found TFNG in ComputerReadingTest.tsx");
}
