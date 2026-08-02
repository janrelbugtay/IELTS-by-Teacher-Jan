const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/AprilListeningTest.tsx',
  'src/pages/AugustListeningTest.tsx',
  'src/pages/ComputerListeningTest.tsx',
  'src/pages/FebruaryListeningTest.tsx',
  'src/pages/JanuaryListeningTest.tsx',
  'src/pages/JulyListeningTest.tsx',
  'src/pages/JuneListeningTest.tsx',
  'src/pages/MarchListeningTest.tsx',
  'src/pages/MayListeningTest.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/width="400"/g, 'width="100%" style={{ maxWidth: "400px" }}');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Iframe width patched.');
