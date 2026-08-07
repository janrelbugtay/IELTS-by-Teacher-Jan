const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const target = `                ) : qState === 'waiting_to_record' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
                     <Mic size={20} />
                     <span className="font-bold text-sm uppercase tracking-wider">Ready to Record</span>
                  </div>
                ) : qState === 'recording' && phase !== 'intro' && phase !== 'p2-prep' ? (`;

const replacement = `                ) : qState === 'waiting_to_record' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  phase === 'p3' || phase === 'p1' ? (
                    <button 
                      onClick={() => alert('Sample answer audio/script will be added later.')}
                      className="flex items-center gap-3 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm transition-colors cursor-pointer"
                    >
                       <Play size={18} className="text-[#4F7DFF]" />
                       <span className="font-bold text-sm uppercase tracking-wider">Play Sample Answer</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
                       <Mic size={20} />
                       <span className="font-bold text-sm uppercase tracking-wider">Ready to Record</span>
                    </div>
                  )
                ) : qState === 'recording' && phase !== 'intro' && phase !== 'p2-prep' ? (`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
  console.log("Replaced successfully");
} else {
  console.log("Target not found");
}
