const fs = require('fs');
let content = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf-8');

const targetRegex = /                    \) : \(\n                      <>\n                      <>\n(?:.*?\n)*?                      <\/>\n                    \)}/g;

const lines = content.split('\n');
let newLines = [];
let skip = false;
let foundStart = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(') : (') && lines[i+1]?.includes('<>') && lines[i+2]?.includes('<>')) {
     skip = true;
     newLines.push('                    ) : (');
     newLines.push('                      <>');
     newLines.push('                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 1:</span> What Lucy Taught Us</span></div>');
     newLines.push('                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 2:</span> The history of tea</span></div>');
     newLines.push('                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 3:</span> Knowledge in medicine</span></div>');
     newLines.push('                      </>');
     newLines.push('                    )}');
     
     // Skip lines until we find the closing )} that matches this block
     let j = i + 1;
     while (j < lines.length && !lines[j].includes(')}')) {
        j++;
     }
     i = j; // skip to the end of the malformed block
     continue;
  }
  newLines.push(lines[i]);
}

fs.writeFileSync('src/pages/PracticeTests.tsx', newLines.join('\n'));
console.log("Fixed syntax");
