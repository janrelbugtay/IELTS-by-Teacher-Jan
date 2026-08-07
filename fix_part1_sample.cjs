const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const target1 = `              {showSampleAnswer && MOCK_QUESTIONS.part1[qIndex].sampleAnswer && (
                <div className="mt-8 mx-auto max-w-2xl text-left p-6 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-slate-700 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                   <div className="text-xs text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold">Sample Answer</div>
                   {MOCK_QUESTIONS.part1[qIndex].sampleAnswer}
                </div>
              )}`;
code = code.replace(target1, "");

const target2 = `                ) : qState === 'waiting_to_record' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  phase === 'p3' || phase === 'p1' ? (
                    <button 
                      onClick={() => {
                        const arr = phase === 'p1' ? MOCK_QUESTIONS.part1 : MOCK_QUESTIONS.part3;
                        const sample = arr[qIndex].sampleAnswer;
                        if (sample) {
                            playSampleAnswerText(sample);
                        } else {
                            alert('Sample answer not available yet.');
                        }
                      }}
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

const replacement2 = `                ) : qState === 'waiting_to_record' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  phase === 'p3' ? (
                    <button 
                      onClick={() => {
                        const arr = MOCK_QUESTIONS.part3;
                        const sample = arr[qIndex].sampleAnswer;
                        if (sample) {
                            playSampleAnswerText(sample);
                        } else {
                            alert('Sample answer not available yet.');
                        }
                      }}
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
                
code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Updated");
