const fs = require('fs');

const files = [
  'src/pages/ComputerReadingTest.tsx',
  'src/pages/AprilReadingTest.tsx',
  'src/pages/MayReadingTest.tsx',
  'src/pages/FebruaryReadingTest.tsx',
  'src/pages/MarchReadingTest.tsx',
  'src/pages/AugustReadingTest.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the hardcoded isInputType
    const hardcodedStr = "const isInputType = activeReviewQuestion <= 7 || (activeReviewQuestion >= 23 && activeReviewQuestion <= 26) || (activeReviewQuestion >= 33 && activeReviewQuestion <= 40);";
    
    const newLogic = `
    const isInputType = answerParts.length > 0 && !['TRUE', 'FALSE', 'NOT GIVEN', 'YES', 'NO'].includes(answerParts[0].toUpperCase()) && answerParts[0].length > 1;
    `;
    
    content = content.replace(hardcodedStr, newLogic);
    
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  }
}
