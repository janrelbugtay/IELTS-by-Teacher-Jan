const fs = require('fs');

const files = fs.readdirSync('src/pages').filter(f => f.endsWith('ReadingTest.tsx'));

const newContent = `                              {block.type === 'choice' && (
                                <div className="relative mt-2 max-w-[200px]">
                                  <select
                                    disabled={reviewMode}
                                    className={\`w-full border-2 rounded-lg p-3 pr-10 focus:outline-none transition-all shadow-sm font-bold text-[1em] appearance-none cursor-pointer \${
                                      reviewMode
                                        ? (isCorrect
                                            ? (colorTheme !== 'standard' ? 'bg-[#1a2e1a] border-green-800 text-green-400 pointer-events-none' : 'bg-green-50 border-green-300 text-green-900 pointer-events-none')
                                            : (colorTheme !== 'standard' ? 'bg-[#3a1a1a] border-red-800 text-red-400 pointer-events-none' : 'bg-red-50 border-red-400 text-red-700 pointer-events-none'))
                                        : \`focus:border-blue-500 \${theme.input} \${theme.border}\`
                                    }\`}
                                    value={answers[q.id] || ''}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  >
                                    <option value="" disabled>Select...</option>
                                    {block.options.map((opt: string) => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                  <div className={\`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none \${reviewMode ? (isCorrect ? (colorTheme !== 'standard' ? 'text-green-400' : 'text-green-600') : (colorTheme !== 'standard' ? 'text-red-400' : 'text-red-600')) : theme.text}\`}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                  </div>
                                </div>
                              )}`;

files.forEach(f => {
  let file = 'src/pages/' + f;
  let content = fs.readFileSync(file, 'utf8');

  // Need to find the block to replace using regex, since there are some variations in spacing or exact code
  // The block starts with `{block.type === 'choice' && (` and ends with `)}` before `{block.type === 'dropdown' && (`
  
  const regex = /\{block\.type === 'choice' && \([\s\S]*?\}\)[\s\n]*\}([\s\n]*\{block\.type === 'dropdown' && \()/;
  
  if (regex.test(content)) {
    content = content.replace(regex, newContent + "$1");
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated choice rendering in', file);
  } else {
    console.log('Could not find choice rendering in', file);
  }
});
