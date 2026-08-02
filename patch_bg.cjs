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

  // Replace fixed inset-0 and radial gradient with a simpler min-h-screen background
  content = content.replace(
    /<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 bg-\[radial-gradient\(#e5e7eb_1px,transparent_1px\)\] \[background-size:16px_16px\] p-4 sm:p-8">/g,
    '<div className="min-h-screen w-full z-50 flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-8">'
  );

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Background patched.');
