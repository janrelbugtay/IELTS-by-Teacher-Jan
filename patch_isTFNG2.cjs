const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const target = `                                    return (
                                      <div key={idx} className={\`mt-1 font-normal \${colorTheme !== 'standard' ? 'text-white' : 'text-black'}\`}>
                                        <span className="uppercase text-[1.1em] underline decoration-2 font-bold">{keyword}</span>
                                        <span>{rest}</span>
                                      </div>
                                    );
                                  }
                                  return <div key={idx} className={\`mb-2 italic font-bold \${theme.boxSub}\`}>{line}</div>;`;

const replacement = `                                    return (
                                      <div key={idx} className={\`mt-1 font-normal \${colorTheme !== 'standard' ? 'text-white' : 'text-black'}\`}>
                                        <span className="uppercase text-[1.1em] underline decoration-2">{keyword}</span>
                                        <span>{rest}</span>
                                      </div>
                                    );
                                  }
                                  return <div key={idx} className={\`mb-2 italic \${theme.boxSub}\`}>{line}</div>;`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/ComputerReadingTest.tsx', code.replace(target, replacement));
  console.log("Patched isTFNG2 successfully");
} else {
  console.log("Target isTFNG2 not found");
}
