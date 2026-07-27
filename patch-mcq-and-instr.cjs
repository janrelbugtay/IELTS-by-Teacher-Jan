const fs = require('fs');

const files = fs.readdirSync('src/pages').filter(f => f.endsWith('ReadingTest.tsx'));

const mcqOldStart = `{(block.type === 'mcq' || block.type === 'matching') && (`;

const mcqNew = `                              {(block.type === 'mcq' || block.type === 'matching') && (() => {
                                const lines = q.text ? q.text.split('\\n') : [];
                                let extractedOptions = {};
                                if (block.type === 'mcq') {
                                  lines.forEach(l => {
                                    if (/^[A-H][\\.\\)]?\\s+/.test(l.trim())) {
                                      extractedOptions[l.trim().charAt(0)] = l.trim();
                                    }
                                  });
                                }
                                return (
                                <div className="space-y-3">
                                  {(q.options || block.options).map((opt: string, optIdx: number) => {
                                    const optionLetter = opt.split(/[\\s.]+/)[0];
                                    const isSelected = answers[q.id] === optionLetter;
                                    const isThisOptionCorrect = block.type === 'mcq' || block.type === 'matching' ? ((currentAnswerKey as any)[q.id] === optionLetter) : ((currentAnswerKey as any)[q.id] === opt);
                                    
                                    let labelClass = \`flex items-start gap-3 p-4 rounded-lg border-2 transition-all shadow-sm \${reviewMode ? 'cursor-pointer' : 'cursor-pointer'} \`;
                                    
                                    if (reviewMode) {
                                        if (isThisOptionCorrect) {
                                            labelClass += (colorTheme !== 'standard' ? 'border-green-600 bg-[#1a2e1a] text-green-400 ' : 'border-green-500 bg-green-100 text-green-800 ');
                                        } else if (isSelected && !isThisOptionCorrect) {
                                            labelClass += (colorTheme !== 'standard' ? 'border-red-600 bg-[#3a1a1a] text-red-400 ' : 'border-red-500 bg-red-100 text-red-800 ');
                                        } else {
                                            labelClass += (colorTheme !== 'standard' ? 'border-gray-800 bg-[#111] text-gray-500 opacity-60 ' : 'border-gray-200 bg-gray-50 text-gray-400 opacity-60 ');
                                        }
                                    } else {
                                        labelClass += isSelected ? theme.radioChecked : theme.radioUnchecked;
                                    }

                                    const displayText = extractedOptions[optionLetter] || opt;

                                    return (
                                      <label key={optIdx} className={labelClass}>
                                        <input
                                          type="radio"
                                          disabled={reviewMode}
                                          name={\`question-\${q.id}\`}
                                          value={optionLetter}
                                          checked={isSelected}
                                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                          className={\`mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 \${reviewMode ? 'cursor-pointer' : 'cursor-pointer'}\`}
                                        />
                                        <span className="font-medium text-[1em] leading-relaxed">{displayText}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                                );
                              })()}`;

const instrNew = `                        {(() => {
                          const lines = (block.instruction || '').split('\\n');
                          const normalLines: string[] = [];
                          const optionLines: string[] = [];
                          
                          const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
                          
                          if (isTFNG) {
                            return (
                              <div className={\`mt-2 font-bold text-[1.25em] \${colorTheme !== 'standard' ? 'text-white' : 'text-black'}\`}>
                                {lines.map((line: string, idx: number) => {
                                  if (line.startsWith('TRUE') || line.startsWith('FALSE') || line.startsWith('NOT GIVEN') ||
                                      line.startsWith('YES') || line.startsWith('NO')) {
                                    const keyword = line.startsWith('NOT GIVEN') ? 'NOT GIVEN' : line.split(' ')[0];
                                    const rest = line.substring(keyword.length);
                                    return (
                                      <div key={idx} className="mt-1">
                                        <span className="uppercase text-[1.1em] underline decoration-2">{keyword}</span>
                                        <span>{rest}</span>
                                      </div>
                                    );
                                  }
                                  return <div key={idx} className="mb-2">{line}</div>;
                                })}
                              </div>
                            );
                          }

                          lines.forEach((line: string) => {
                            if (/^[A-K][\\.\\)]?\\s+/.test(line.trim())) {
                              optionLines.push(line);
                            } else {
                              if (optionLines.length === 0) {
                                normalLines.push(line);
                              } else {
                                optionLines.push(line); 
                              }
                            }
                          });

                          return (
                            <>
                              {normalLines.length > 0 && (
                                <p className={\`mt-2 whitespace-pre-wrap italic text-[1.25em] \${theme.boxSub}\`}>
                                  {normalLines.join('\\n')}
                                </p>
                              )}
                              {optionLines.length > 0 && (
                                <div className={\`mt-4 font-sans not-italic text-[1.25em] font-bold \${colorTheme !== 'standard' ? 'text-white' : 'text-black'}\`}>
                                  {optionLines.map((line: string, idx: number) => (
                                    <div key={idx} className="mb-1.5 last:mb-0">{line}</div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}`;

files.forEach(f => {
  let file = 'src/pages/' + f;
  let content = fs.readFileSync(file, 'utf8');

  let changed = false;

  // Replace MCQ logic
  const mcqStartIndex = content.indexOf("{(block.type === 'mcq' || block.type === 'matching') && (");
  if (mcqStartIndex !== -1) {
    // Find the end of this block
    // It ends right before `{block.type === 'choice' && (`
    const mcqEndIndex = content.indexOf("{block.type === 'choice' && (", mcqStartIndex);
    if (mcqEndIndex !== -1) {
       const blockText = content.substring(mcqStartIndex, mcqEndIndex);
       const lastClosing = blockText.lastIndexOf(")}");
       if (lastClosing !== -1) {
          const fullBlockToReplace = blockText.substring(0, lastClosing + 2);
          content = content.replace(fullBlockToReplace, mcqNew);
          changed = true;
          console.log('Replaced MCQ in', file);
       }
    }
  }

  // Also we need to strip extracted options from q.text when rendering the question text.
  const textRenderingStart = `<p className={\`leading-relaxed mt-1 whitespace-pre-wrap \${(block.options && (block.options.includes('TRUE') || block.options.includes('YES'))) ? 'font-bold text-[1.05em] text-black ' + (colorTheme !== 'standard' ? 'text-white' : 'text-black') : 'font-medium text-[1em] ' + theme.text}\`}>`;
  
  const textRenderingNew = `<p className={\`leading-relaxed mt-1 whitespace-pre-wrap \${(block.options && (block.options.includes('TRUE') || block.options.includes('YES'))) ? 'font-bold text-[1.05em] text-black ' + (colorTheme !== 'standard' ? 'text-white' : 'text-black') : 'font-medium text-[1em] ' + theme.text}\`}>
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
                                    if (block.type !== 'input') return displayQText;
                                    const regex = new RegExp(\`(?:\\\\b\${q.id}\\\\s*)?_{2,}\`, 'g');
                                    const parts = displayQText.split(regex);`;
  
  // We need to replace the block that starts with `if (block.type !== 'input') return q.text;`
  const returnQTextPattern = `if (block.type !== 'input') return q.text;
                                    const regex = new RegExp(\`(?:\\\\b\${q.id}\\\\s*)?_{2,}\`, 'g');
                                    const parts = q.text.split(regex);`;

  if (content.includes(returnQTextPattern)) {
     content = content.replace(returnQTextPattern, `
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
                                    if (block.type !== 'input') return displayQText;
                                    const regex = new RegExp(\`(?:\\\\b\${q.id}\\\\s*)?_{2,}\`, 'g');
                                    const parts = displayQText.split(regex);`);
     changed = true;
     console.log('Replaced q.text rendering in', file);
  }


  // For instruction
  if (file === 'src/pages/ComputerReadingTest.tsx') {
    // ComputerReadingTest.tsx has:
    /*
                        {(() => {
                          const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
                          if (isTFNG) {
    ...
                          return <p className={`mt-2 whitespace-pre-wrap italic text-[1.25em] ${theme.boxSub}`}>{block.instruction}</p>;
                        })()}
    */
    const compRegex = /\{\(\(\) => \{\s*const isTFNG = block\.options[\s\S]*?return <p className=\{\`mt-2 whitespace-pre-wrap italic text-\[1\.25em\] \$\{theme\.boxSub\}\`\}>\{block\.instruction\}<\/p>;\s*\}\)\(\)\}/;
    if (compRegex.test(content)) {
       content = content.replace(compRegex, instrNew);
       changed = true;
       console.log('Replaced instruction logic in ComputerReadingTest.tsx');
    } else {
       console.log('Could not find instruction logic in ComputerReadingTest.tsx');
    }
  } else {
    // Others have:
    /*
                        {(() => {
                          const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
    ...
                          return (
                            <>
    ...
                              {optionLines.length > 0 && (
                                <div className={`mt-4 p-5 border-2 rounded-lg shadow-sm font-sans not-italic text-[1.25em] font-semibold ${theme.box} ${theme.border} ${theme.text}`}>
    ...
                        })()}
    */
    const instrRegex = /\{\(\(\) => \{\s*const isTFNG = block\.options && \(block\.options\.includes\('TRUE'\) \|\| block\.options\.includes\('YES'\)\);[\s\S]*?\}\)\(\)\}/;
    if (instrRegex.test(content)) {
       content = content.replace(instrRegex, instrNew);
       changed = true;
       console.log('Replaced instruction logic in', file);
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
