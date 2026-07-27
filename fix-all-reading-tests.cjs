const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('ReadingTest.tsx'));

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace text rendering
  content = content.replace(
    /<p className={`font-medium text-\[1em\] leading-relaxed (mt-1 )?\${theme.text}`}>{q.text}<\/p>/g,
    `<p className={\`font-medium text-[1em] leading-relaxed $1\${theme.text} whitespace-pre-wrap\`}>
                                  {(() => {
                                    if (block.type !== 'input') return q.text;
                                    const regex = new RegExp(\`(?:\\\\b\${q.id}\\\\s*)?_{2,}\`, 'g');
                                    const parts = q.text.split(regex);
                                    if (parts.length <= 1) return q.text;
                                    
                                    return (
                                      <>
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
                                      </>
                                    );
                                  })()}
                                </p>`
  );
  
  // Conditionally hide the standalone input box if it was rendered inline
  const originalInputCode = `{block.type === 'input' && (
                                 <input
                                   type="text"`;
                                   
  const replacedInputCode = `{block.type === 'input' && !new RegExp(\`(?:\\\\b\${q.id}\\\\s*)?_{2,}\`).test(q.text) && (
                                 <input
                                   type="text"`;
                                   
  content = content.replace(originalInputCode, replacedInputCode);
  
  // also fix if the file had placeholder="" to placeholder=q.id.toString()
  content = content.replace(
    /placeholder=\{reviewMode \? \(answers\[q\.id\] \|\| "No Answer"\) : ""\}/g,
    'placeholder={reviewMode ? (answers[q.id] || "No Answer") : q.id.toString()}'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', filePath);
};

files.forEach(f => fixFile(path.join(srcDir, f)));
