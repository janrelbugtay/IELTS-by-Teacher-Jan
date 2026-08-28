const fs = require('fs');

let file = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Fix Part 2 Preparation card responsiveness
file = file.replace(
  '<div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200">',
  '<div className="flex flex-col md:flex-row items-center md:justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-200 gap-4 md:gap-0">'
);
// Fix button wrap
file = file.replace(
  '<div className="flex items-center gap-3">',
  '<div className="flex flex-wrap items-center justify-center gap-3">'
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', file);
console.log("Patched LiveSpeakingTestScreen");
