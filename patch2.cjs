const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Update Status Indicator block
const oldStatus = `                {phase === 'completed' ? (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-sm uppercase tracking-wider">Ready to Submit</span>
                  </div>
                ) : qState === 'recording' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-2.5 rounded-full shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                    <span className="font-bold text-sm uppercase tracking-wider">Recording</span>
                  </div>
                ) : qState === 'ai_speaking' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 text-[#4F7DFF] bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100 shadow-sm">
                     <Volume2 size={20} className="animate-pulse" />
                     <span className="font-bold text-sm uppercase tracking-wider">Examiner</span>
                  </div>
                ) : qState === 'reviewing' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-sm uppercase tracking-wider">Ready to review</span>
                  </div>
                ) : (
                  <div className="text-slate-500 font-bold text-sm px-4 flex items-center gap-2 uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-slate-300" /> Standby
                  </div>
                )}`;

const newStatus = `                {qState === 'ai_speaking' && phase !== 'intro' ? (
                  <div className="flex items-center gap-3 text-[#4F7DFF] bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100 shadow-sm">
                     <Volume2 size={20} className="animate-pulse" />
                     <span className="font-bold text-sm uppercase tracking-wider">Examiner</span>
                  </div>
                ) : phase === 'completed' ? (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-sm uppercase tracking-wider">Ready to Submit</span>
                  </div>
                ) : qState === 'recording' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-2.5 rounded-full shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                    <span className="font-bold text-sm uppercase tracking-wider">Recording</span>
                  </div>
                ) : qState === 'reviewing' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-sm uppercase tracking-wider">Ready to review</span>
                  </div>
                ) : (
                  <div className="text-slate-500 font-bold text-sm px-4 flex items-center gap-2 uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-slate-300" /> Standby
                  </div>
                )}`;

code = code.replace(oldStatus, newStatus);

// Update Submit button block
const oldSubmit = `{phase === 'completed' && (
                  <button 
                    onClick={() => {
                      onComplete(responses); 
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-md text-base tracking-wide"
                  >
                    Submit Test
                  </button>
                )}`;
                
const newSubmit = `{phase === 'completed' && qState !== 'ai_speaking' && (
                  <button 
                    onClick={() => {
                      onComplete(responses); 
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-md text-base tracking-wide animate-in fade-in zoom-in duration-300"
                  >
                    Submit Test
                  </button>
                )}`;

code = code.replace(oldSubmit, newSubmit);

// And we need to hide the Skip button in p2-prep when AI is speaking, 
// or at least let the user skip? If they skip prep, they skip the AI talking too!
/*
                {phase === 'p2-prep' && (
                   <button 
                      onClick={() => {
                        setPhase('p2');
                        setQState('ai_speaking');
                      }}
                      className="flex items-center gap-2 text-slate-500 hover:text-slate-800 px-6 py-3 h-12 font-bold text-sm tracking-wide transition-colors"
                    >
                      Skip Prep
                    </button>
                )}
*/
const oldSkip = `{phase === 'p2-prep' && (
                   <button 
                      onClick={() => {
                        setPhase('p2');
                        setQState('ai_speaking');
                      }}`;
                      
const newSkip = `{phase === 'p2-prep' && qState !== 'ai_speaking' && (
                   <button 
                      onClick={() => {
                        setPhase('p2');
                        setQState('ai_speaking');
                      }}`;

code = code.replace(oldSkip, newSkip);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Done patching 2");
