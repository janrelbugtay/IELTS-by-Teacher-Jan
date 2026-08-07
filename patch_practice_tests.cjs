const fs = require('fs');
let content = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf-8');

// The original block
const targetBlock = `                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 1:</span> Science and Technology</span></div>
                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 2:</span> History and Archaeology</span></div>
                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 3:</span> Arts and Culture</span></div>`;

// The new block with correct August titles and fallback
const replacementBlock = `                      <>
                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 1:</span> What Lucy Taught Us</span></div>
                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 2:</span> The history of tea</span></div>
                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 3:</span> Knowledge in medicine</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 1:</span> What Lucy Taught Us</span></div>
                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 2:</span> The history of tea</span></div>
                        <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 3:</span> Knowledge in medicine</span></div>`;

content = content.replace(targetBlock, replacementBlock);
fs.writeFileSync('src/pages/PracticeTests.tsx', content);
console.log("Patched PracticeTests.tsx");
