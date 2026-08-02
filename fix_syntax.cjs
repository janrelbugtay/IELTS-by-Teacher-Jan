const fs = require('fs');

const files = [
  'src/pages/AprilListeningTest.tsx',
  'src/pages/AprilReadingTest.tsx',
  'src/pages/AugustListeningTest.tsx',
  'src/pages/AugustReadingTest.tsx',
  'src/pages/ComputerListeningTest.tsx',
  'src/pages/ComputerReadingTest.tsx',
  'src/pages/FebruaryListeningTest.tsx',
  'src/pages/FebruaryReadingTest.tsx',
  'src/pages/JanuaryListeningTest.tsx',
  'src/pages/JulyListeningTest.tsx',
  'src/pages/JuneListeningTest.tsx',
  'src/pages/MarchListeningTest.tsx',
  'src/pages/MarchReadingTest.tsx',
  'src/pages/MayListeningTest.tsx',
  'src/pages/MayReadingTest.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Let's remove ALL `const finalScore = ...` and `const finalBandScore = ...` first
  content = content.replace(/    const finalScore = manualScore !== null \? manualScore : score;\n    const finalBandScore = manualBandScore !== null \? manualBandScore : bandScore;\n\n/g, '');

  // Now, there might still be some left over `else if (score >= 1) bandScore = 1.0;` if it was duplicated.
  // Actually, let's just find the last `else if (score >= 2) bandScore = 2.0;` block and replace it correctly.
  
  // It's safer to just replace any `else if (score >= 1) bandScore = 1.0;` with itself + the finalScore definition.
  // But wait, there might be two `else if (score >= 1) bandScore = 1.0;` in a row!
  content = content.replace(/(\s*else if \(score >= 1\) bandScore = 1\.0;)+/g, `
    else if (score >= 1) bandScore = 1.0;
    const finalScore = manualScore !== null ? manualScore : score;
    const finalBandScore = manualBandScore !== null ? manualBandScore : bandScore;
`);

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed syntax');
