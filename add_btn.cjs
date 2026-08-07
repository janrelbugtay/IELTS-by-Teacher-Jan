const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const target = `          {phase === 'p2' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 fade-in w-full max-w-3xl mx-auto">
               <div className="flex justify-center">
                 <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-8 py-3 rounded-full text-base font-bold border border-[#4F7DFF]/20 shadow-sm mb-4 tracking-wide">
                    Part 2: Long Turn
                  </div>
               </div>
               <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-lg">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight text-center mb-6">{MOCK_QUESTIONS.part2.topic}</h3>
                <p className="text-slate-600 mb-4 font-medium text-lg">You should say:</p>
                <ul className="list-disc pl-8 space-y-3 text-slate-700 text-lg font-light">
                  {MOCK_QUESTIONS.part2.bulletPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
              {notes && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-slate-700 whitespace-pre-wrap font-mono text-lg shadow-inner">
                  <div className="text-xs text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold">Your Notes</div>
                  {notes}
                </div>
              )}
            </div>
          )}`;

const replacement = `          {phase === 'p2' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 fade-in w-full max-w-3xl mx-auto">
               <div className="flex justify-center">
                 <div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-8 py-3 rounded-full text-base font-bold border border-[#4F7DFF]/20 shadow-sm mb-4 tracking-wide">
                    Part 2: Long Turn
                  </div>
               </div>
               <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-lg">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight text-center mb-6">{MOCK_QUESTIONS.part2.topic}</h3>
                <p className="text-slate-600 mb-4 font-medium text-lg">You should say:</p>
                <ul className="list-disc pl-8 space-y-3 text-slate-700 text-lg font-light mb-6">
                  {MOCK_QUESTIONS.part2.bulletPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
                
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={() => {
                      alert('Sample answer audio/script will be added later.');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full font-medium transition-colors border border-slate-200 shadow-sm"
                  >
                    <Play size={18} className="text-[#4F7DFF]" />
                    Play Sample Answer
                  </button>
                </div>
              </div>
              {notes && (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-slate-700 whitespace-pre-wrap font-mono text-lg shadow-inner">
                  <div className="text-xs text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold">Your Notes</div>
                  {notes}
                </div>
              )}
            </div>
          )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
  console.log("Replaced successfully");
} else {
  console.log("Target not found!");
}
