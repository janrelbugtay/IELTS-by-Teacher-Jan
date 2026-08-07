const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

// Replace the custom button with a native audio player for testing.
// Find the button and replace it.
const btnPart1 = `<button 
                          onClick={() => togglePlayAudio(q.id)} 
                          disabled={!getAudioUrl(q.id)}
                          className={\`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold border \${getAudioUrl(q.id) ? 'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}\`}
                        >
                          {playingId === q.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {playingId === q.id ? 'Pause Recording' : 'Play Recording'}
                        </button>`;

const newBtnPart1 = `
                        {getAudioUrl(q.id) ? (
                          <audio controls src={getAudioUrl(q.id) as string} className="w-full max-w-sm mt-2" />
                        ) : (
                          <div className="text-slate-400 text-sm italic">No recording</div>
                        )}`;

const btnPart2 = `<button 
                    onClick={() => togglePlayAudio(testQuestions.part2.id)} 
                    disabled={!getAudioUrl(testQuestions.part2.id)}
                    className={\`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold border \${getAudioUrl(testQuestions.part2.id) ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}\`}
                  >
                    {playingId === testQuestions.part2.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {playingId === testQuestions.part2.id ? 'Pause Recording (2 mins)' : 'Play Recording (2 mins)'}
                  </button>`;

const newBtnPart2 = `
                  {getAudioUrl(testQuestions.part2.id) ? (
                    <audio controls src={getAudioUrl(testQuestions.part2.id) as string} className="w-full max-w-sm mt-2" />
                  ) : (
                    <div className="text-slate-400 text-sm italic">No recording</div>
                  )}`;

const btnPart3 = `<button 
                          onClick={() => togglePlayAudio(q.id)} 
                          disabled={!getAudioUrl(q.id)}
                          className={\`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-semibold border \${getAudioUrl(q.id) ? 'bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'}\`}
                        >
                          {playingId === q.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {playingId === q.id ? 'Pause Recording' : 'Play Recording'}
                        </button>`;

const newBtnPart3 = `
                        {getAudioUrl(q.id) ? (
                          <audio controls src={getAudioUrl(q.id) as string} className="w-full max-w-sm mt-2" />
                        ) : (
                          <div className="text-slate-400 text-sm italic">No recording</div>
                        )}`;

code = code.replace(btnPart1, newBtnPart1);
code = code.replace(btnPart2, newBtnPart2);
code = code.replace(btnPart3, newBtnPart3);
fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
console.log("Replaced");
