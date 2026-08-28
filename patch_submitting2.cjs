const fs = require('fs');
let file = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

file = file.replace(
  'className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-md text-base tracking-wide animate-in fade-in zoom-in duration-300"',
  'className={`flex items-center gap-2 px-8 py-3 h-12 rounded-full font-bold transition-all shadow-md text-base tracking-wide animate-in fade-in zoom-in duration-300 ${isSubmitting ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}'
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', file);
console.log("Patched button styling");
