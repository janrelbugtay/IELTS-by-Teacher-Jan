const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const target = `                          const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
                          
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
                                        <span className="uppercase text-[1.1em] underline decoration-2">{keyword}</span>
                                        <span>{rest}</span>
                                      </div>
                                    );
                                  }
                                  return <div key={idx} className={\`mb-2 italic \${theme.boxSub}\`}>{line}</div>;
                                })}
                              </div>
                            );
                          }`;

const replacement = `                          const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
                          
                          if (isTFNG) {
                            return (
                              <div className="mt-2 text-[1.25em]">
                                {lines.map((line: string, idx: number) => {
                                  if (line.startsWith('TRUE') || line.startsWith('FALSE') || line.startsWith('NOT GIVEN') ||
                                      line.startsWith('YES') || line.startsWith('NO')) {
                                    const keyword = line.startsWith('NOT GIVEN') ? 'NOT GIVEN' : line.split(' ')[0];
                                    const rest = line.substring(keyword.length);
                                    return (
                                      <div key={idx} className={\`mt-1 font-normal \${colorTheme !== 'standard' ? 'text-white' : 'text-black'}\`}>
                                        <span className="uppercase text-[1.1em] underline decoration-2 font-bold">{keyword}</span>
                                        <span>{rest}</span>
                                      </div>
                                    );
                                  }
                                  return <div key={idx} className={\`mb-2 italic font-bold \${theme.boxSub}\`}>{line}</div>;
                                })}
                              </div>
                            );
                          }`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/ComputerReadingTest.tsx', code.replace(target, replacement));
  console.log("Patched isTFNG successfully");
} else {
  console.log("Target isTFNG not found");
}
