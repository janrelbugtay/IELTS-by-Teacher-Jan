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
  content = content.replace("const { updateDoc, doc } = require('firebase/firestore');", "");
  content = content.replace("const { db } = require('../lib/firebase');", "");
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed requires');
