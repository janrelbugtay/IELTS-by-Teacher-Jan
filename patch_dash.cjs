const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

code = code.replace(
  `const sScore = averageScore(speakingSubs);`,
  `const sScore = averageScore([...speakingSubs, ...offlineSpeakingSubs]);`
);

code = code.replace(
  `                  <div key={sub.id} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
                    <div className="sm:w-[45%] relative bg-slate-800 group flex items-center justify-center min-h-[160px]">
                      <Mic className="w-12 h-12 text-emerald-400 opacity-50" />
                    </div>`,
  `                  <div key={sub.id} onClick={() => { navigate(isShared ? \`/shared/results/\${sub.id}\` : \`/results/\${sub.id}\`); }} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer">
                    <div className="sm:w-[45%] relative bg-slate-800 group flex items-center justify-center min-h-[160px]">
                      <Mic className="w-12 h-12 text-emerald-400 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                    </div>`
);

code = code.replace(
  `                      <div className="mt-auto flex gap-2 flex-wrap sm:flex-nowrap">
                        <button onClick={() => { navigate(isShared ? \`/shared/results/\${sub.id}\` : \`/results/\${sub.id}\`); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors text-center whitespace-nowrap">
                          Feedback
                        </button>
                        {sub.audioUrl && (
                          <a href={sub.audioUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center" title="Download">
                            <Upload className="w-3.5 h-3.5" />
                          </a>
                        )}`,
  `                      <div className="mt-auto flex gap-2 flex-wrap sm:flex-nowrap">
                        <button onClick={(e) => { e.stopPropagation(); navigate(isShared ? \`/shared/results/\${sub.id}\` : \`/results/\${sub.id}\`); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors text-center whitespace-nowrap">
                          Feedback
                        </button>
                        {sub.audioUrl && (
                          <a href={sub.audioUrl} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center" title="Download">
                            <Upload className="w-3.5 h-3.5" />
                          </a>
                        )}`
);

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
