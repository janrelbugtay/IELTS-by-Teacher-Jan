const fs = require('fs');

let file = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Adjust timer size on mobile
file = file.replace(
  '<div className="text-3xl font-mono font-bold text-slate-800 flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-full border border-slate-200 shadow-inner">',
  '<div className="text-2xl md:text-3xl font-mono font-bold text-slate-800 flex items-center gap-2 md:gap-3 bg-slate-50 px-4 py-2 md:px-6 md:py-3 rounded-full border border-slate-200 shadow-inner">'
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', file);
console.log("Patched LiveSpeakingTestScreen again");
