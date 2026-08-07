const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const target = `const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
                          
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
                            if (/^(?:[A-K][.)]?\\s+|(?:i{1,3}|iv|v|vi{1,3}|ix|x)[.)]\\s+)/i.test(line.trim())) {
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
                              {optionLines.length > 0 && (`;

const replacement = `const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
                          
                          if (isTFNG) {
                            return (
                              <div className={\`mt-2 text-[1.25em] \${colorTheme !== 'standard' ? 'text-white' : 'text-black'}\`}>
                                {lines.map((line: string, idx: number) => {
                                  if (line.startsWith('TRUE') || line.startsWith('FALSE') || line.startsWith('NOT GIVEN') ||
                                      line.startsWith('YES') || line.startsWith('NO')) {
                                    const keyword = line.startsWith('NOT GIVEN') ? 'NOT GIVEN' : line.split(' ')[0];
                                    const rest = line.substring(keyword.length);
                                    return (
                                      <div key={idx} className="mt-1 font-normal">
                                        <span className="uppercase text-[1.1em] underline decoration-2 font-bold">{keyword}</span>
                                        <span>{rest}</span>
                                      </div>
                                    );
                                  }
                                  return <div key={idx} className={\`mb-2 italic \${theme.boxSub}\`}>{line}</div>;
                                })}
                              </div>
                            );
                          }

                          lines.forEach((line: string) => {
                            if (/^(?:[A-K][.)]?\\s+|(?:i{1,3}|iv|v|vi{1,3}|ix|x)[.)]\\s+)/i.test(line.trim())) {
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
                                <div className="mt-2 text-[1.25em]">
                                  {normalLines.map((line: string, idx: number) => {
                                    if (line.trim().endsWith('?')) {
                                      return <div key={idx} className={\`mt-2 font-medium not-italic \${colorTheme !== 'standard' ? 'text-white' : 'text-black'}\`}>{line}</div>;
                                    }
                                    return <div key={idx} className={\`italic \${theme.boxSub} whitespace-pre-wrap\`}>{line}</div>;
                                  })}
                                </div>
                              )}
                              {optionLines.length > 0 && (`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/ComputerReadingTest.tsx', code.replace(target, replacement));
  console.log("Patched successfully");
} else {
  console.log("Target not found");
}
