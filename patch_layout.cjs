const fs = require('fs');
const file = 'src/pages/ComputerReadingTest.tsx';
let content = fs.readFileSync(file, 'utf8');

// The block starts around 1996
const target = `<div className="flex justify-between items-start mb-4 gap-4">
                                <p className={\`leading-relaxed mt-1 whitespace-pre-wrap font-medium text-[1em] \${theme.text}\`}>
                                  {(() => {
                                    
                                    let displayQText = q.text;`;

const replacement = `<div className="flex justify-between items-start gap-4">
                                  {(() => {
                                    
                                    let displayQText = q.text;
                                    if (block.type === 'mcq') {
                                      const textLines = (q.text || '').split('\\n');
                                      const newMainText = [];
                                      textLines.forEach(l => {
                                         if (!/^[A-H][\\.\\)]?\\s+/.test(l.trim())) {
                                            newMainText.push(l);
                                         }
                                      });
                                      displayQText = newMainText.join('\\n');
                                    }
                                    if (displayQText && displayQText.trim() === \`Question \${q.id}\`) {
                                      displayQText = "";
                                    }
                                    if (block.type !== 'input') {
                                        return displayQText ? <p className={\`leading-relaxed mt-1 whitespace-pre-wrap font-medium text-[1em] mb-4 \${theme.text}\`}>{displayQText}</p> : <div className="mb-4"></div>;
                                    }
                                    const regex = new RegExp(\`(?:\\\\b\${q.id}\\\\s*)?_{2,}\`, 'g');
                                    const parts = displayQText.split(regex);
                                    if (parts.length <= 1) {
                                        return displayQText ? <p className={\`leading-relaxed mt-1 whitespace-pre-wrap font-medium text-[1em] mb-4 \${theme.text}\`}>{displayQText}</p> : <div className="mb-4"></div>;
                                    }
                                    
                                    return (
                                      <p className={\`leading-relaxed mt-1 whitespace-pre-wrap font-medium text-[1em] mb-4 \${theme.text}\`}>
                                        {parts.map((part, i) => (
                                          <React.Fragment key={i}>
                                            {part}
                                            {i < parts.length - 1 && (
                                               <input
                                                 type="text"
                                                 disabled={reviewMode}
                                                 className={\`inline-block border-2 rounded px-2 py-1 mx-1 focus:outline-none transition-all shadow-inner font-medium text-[1em] disabled:opacity-100 w-40 \${
                                                   reviewMode
                                                      ? (isCorrect
                                                          ? (colorTheme !== 'standard' ? 'bg-[#1a2e1a] border-green-800 text-green-400 cursor-pointer pointer-events-none' : 'bg-green-50 border-green-300 text-green-900 cursor-pointer pointer-events-none')
                                                         : (colorTheme !== 'standard' ? 'bg-[#3a1a1a] border-red-800 text-red-400 cursor-pointer pointer-events-none' : 'bg-red-50 border-red-400 text-red-700 cursor-pointer font-bold placeholder-red-700 pointer-events-none'))
                                                      : \`focus:border-blue-500 \${theme.input} \${theme.border}\`
                                                 }\`}
                                                 placeholder={reviewMode ? (answers[q.id] || "No Answer") : q.id.toString()}
                                                 value={reviewMode && !answers[q.id] ? "No Answer" : answers[q.id] || ''}
                                                 onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                               />
                                            )}
                                          </React.Fragment>
                                        ))}
                                      </p>
                                    );
                                  })()}
                                
                                {!reviewMode && (`;

content = content.replace(/<div className="flex justify-between items-start mb-4 gap-4">[\s\S]*?{!reviewMode && \(/, replacement);

fs.writeFileSync(file, content);
console.log('patched layout');
