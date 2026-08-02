const fs = require('fs');
let content = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

// Fix the multiline input at 1042
let multilineFix = `<input
                              type="number"
                              step="0.5"
                              min="0"
                              max="9"
                              value={editScoreValue}
                              onChange={(e) = placeholder="Band" title="Band Score" />
         <input type="number" min="0" max="40" className="w-16 px-2 py-1 text-sm border border-slate-300 rounded" value={editRawScoreValue} onChange={(e) => setEditRawScoreValue(e.target.value)} placeholder="Raw" title="Raw Score" /> setEditScoreValue(e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
                              autoFocus
                            />`;

let multilineCorrect = `<input
                              type="number"
                              step="0.5"
                              min="0"
                              max="9"
                              value={editScoreValue}
                              onChange={(e) => setEditScoreValue(e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
                              placeholder="Band"
                              title="Band Score"
                              autoFocus
                            />
                            <input
                              type="number"
                              min="0"
                              max="40"
                              className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
                              value={editRawScoreValue}
                              onChange={(e) => setEditRawScoreValue(e.target.value)}
                              placeholder="Raw"
                              title="Raw Score"
                            />`;

content = content.replace(multilineFix, multilineCorrect);

// Fix the single line inputs
const singleLineRegex = /<input type="number" step="0\.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value=\{editScoreValue\} onChange=\{\(e\) = placeholder="Band" title="Band Score" \/>\s*<input type="number" min="0" max="40" className="w-16 px-2 py-1 text-sm border border-slate-300 rounded" value=\{editRawScoreValue\} onChange=\{\(e\) => setEditRawScoreValue\(e\.target\.value\)\} placeholder="Raw" title="Raw Score" \/> setEditScoreValue\(e\.target\.value\)\} \/>/g;

const singleLineCorrect = `<input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editScoreValue} onChange={(e) => setEditScoreValue(e.target.value)} placeholder="Band" title="Band Score" />
                                  <input type="number" min="0" max="40" className="w-16 px-2 py-1 border border-slate-300 rounded" value={editRawScoreValue} onChange={(e) => setEditRawScoreValue(e.target.value)} placeholder="Raw" title="Raw Score" />`;

content = content.replace(singleLineRegex, singleLineCorrect);

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', content, 'utf8');
console.log('Fixed');
