const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

const testNumBlock = `  let testNum = id || '1';
  const numId = parseInt(testNum, 10);
  if (!isNaN(numId)) {
    testNum = Math.ceil(numId / 4).toString();
  }
`;

// Remove the existing declaration
content = content.replace(testNumBlock, "");

// Insert it before useEffect
content = content.replace(
  "  useEffect(() => {",
  testNumBlock + "  useEffect(() => {"
);

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', content);
console.log("Fixed ReferenceError");
