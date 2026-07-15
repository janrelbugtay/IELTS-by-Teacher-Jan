const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const target = `                {type === 'summary-options' ? (
                  <select
                    disabled={reviewMode}
                    className={\`border-b-2 focus:outline-none focus:border-blue-500 py-1 px-2 pr-6 rounded shadow-sm \${
                       reviewMode
                          ? (isCorrect
                              ? (colorTheme !== 'standard' ? 'bg-[#1a2e1a] text-green-400 border-green-700 font-bold' : 'bg-green-100 text-green-900 border-green-500 font-bold')
                              : (colorTheme !== 'standard' ? 'bg-[#3a1a1a] text-red-400 border-red-700 font-bold' : 'bg-red-100 text-red-900 border-red-500 font-bold'))
                          : theme.input
                    }\`}
                    value={reviewMode && !answers[qId] ? "No Answer" : answers[qId] || ''}
                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {reviewMode && !answers[qId] && <option value="No Answer">No Answer</option>}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled={reviewMode}
                    className={\`border-b-2 focus:outline-none focus:border-blue-500 py-1 px-2 w-32 text-center rounded shadow-sm disabled:opacity-100 \${
                       reviewMode
                          ? (isCorrect
                              ? (colorTheme !== 'standard' ? 'bg-[#1a2e1a] border-green-700 text-green-400 font-bold' : 'bg-green-100 border-green-400 text-green-900 font-bold')
                             : (colorTheme !== 'standard' ? 'bg-[#3a1a1a] border-red-700 text-red-400 font-bold' : 'bg-red-50 border-red-400 text-red-700 font-bold placeholder-red-700'))
                         : theme.input
                    }\`}
                    value={reviewMode ? (answers[qId] || "No Answer") : (answers[qId] || '')}
                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                    placeholder={reviewMode ? "" : "Type answer..."}
                  />
                )}`;

const replacement = `                {type === 'summary-options' ? (
                  <select
                    disabled={reviewMode}
                    className={\`border-b-2 focus:outline-none focus:border-blue-500 py-1 px-2 pr-6 rounded shadow-sm \${
                       reviewMode
                          ? (isCorrect
                              ? (colorTheme !== 'standard' ? 'bg-[#1a2e1a] text-green-400 border-green-700 font-bold pointer-events-none' : 'bg-green-100 text-green-900 border-green-500 font-bold pointer-events-none')
                              : (colorTheme !== 'standard' ? 'bg-[#3a1a1a] text-red-400 border-red-700 font-bold pointer-events-none' : 'bg-red-100 text-red-900 border-red-500 font-bold pointer-events-none'))
                          : theme.input
                    }\`}
                    value={reviewMode && !answers[qId] ? "No Answer" : answers[qId] || ''}
                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {options.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    {reviewMode && !answers[qId] && <option value="No Answer">No Answer</option>}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled={reviewMode}
                    className={\`border-b-2 focus:outline-none focus:border-blue-500 py-1 px-2 w-32 text-center rounded shadow-sm disabled:opacity-100 \${
                       reviewMode
                          ? (isCorrect
                              ? (colorTheme !== 'standard' ? 'bg-[#1a2e1a] border-green-700 text-green-400 font-bold pointer-events-none' : 'bg-green-100 border-green-400 text-green-900 font-bold pointer-events-none')
                             : (colorTheme !== 'standard' ? 'bg-[#3a1a1a] border-red-700 text-red-400 font-bold pointer-events-none' : 'bg-red-50 border-red-400 text-red-700 font-bold placeholder-red-700 pointer-events-none'))
                         : theme.input
                    }\`}
                    value={reviewMode ? (answers[qId] || "No Answer") : (answers[qId] || '')}
                    onChange={(e) => handleAnswerChange(qId, e.target.value)}
                    placeholder={reviewMode ? "" : "Type answer..."}
                  />
                )}`;

if (content.includes(target)) {
  fs.writeFileSync('src/pages/ComputerReadingTest.tsx', content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Target not found");
}
