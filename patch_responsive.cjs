const fs = require('fs');
const path = require('path');

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

  // Fix the container overflow
  content = content.replace(
    /<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 bg-\[radial-gradient\(#e5e7eb_1px,transparent_1px\)\] \[background-size:16px_16px\]">/g,
    '<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] p-4 sm:p-8">'
  );

  content = content.replace(
    /<div className="bg-white p-10 rounded-2xl shadow-2xl w-\[560px\] border border-gray-100 relative overflow-hidden">/g,
    '<div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl w-full max-w-[560px] border border-gray-100 relative overflow-y-auto max-h-full">'
  );

  content = content.replace(
    /className="text-3xl font-extrabold mb-2 text-center/g,
    'className="text-2xl sm:text-3xl font-extrabold mb-2 text-center'
  );

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Patch complete.');
