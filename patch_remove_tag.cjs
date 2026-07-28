const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

code = code.replace(
  /<div className="text-sm font-mono font-medium text-\[#4F7DFF\] bg-\[#4F7DFF\]\/10 px-4 py-1\.5 rounded-full border border-\[#4F7DFF\]\/20 font-bold">\s*\{phase\.toUpperCase\(\)\.replace\('-', ' '\)\}\s*<\/div>/g,
  ''
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
