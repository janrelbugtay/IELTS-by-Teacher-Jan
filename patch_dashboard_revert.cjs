const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const search = `<button onClick={() => setViewFeedbackItem(sub)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors text-center whitespace-nowrap">
                          Feedback
                        </button>`;

const replace = `<button onClick={() => { navigate(isShared ? \`/shared/results/\${sub.id}\` : \`/results/\${sub.id}\`); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors text-center whitespace-nowrap">
                          Feedback
                        </button>`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
