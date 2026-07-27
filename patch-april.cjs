const fs = require('fs');

const files = fs.readdirSync('src/pages').filter(f => f.endsWith('ReadingTest.tsx') && f !== 'ComputerReadingTest.tsx');

files.forEach(f => {
  let file = 'src/pages/' + f;
  let content = fs.readFileSync(file, 'utf8');

  // Let's check if the file has the A-K logic
  if (content.includes('^[A-K][\\.\\)]?\\s+')) {
    const targetContent = `                          lines.forEach((line: string) => {
                            if (/^[A-K][\\.\\)]?\\s+/.test(line.trim())) {
                              optionLines.push(line);
                            } else {
                              if (optionLines.length === 0) {
                                normalLines.push(line);
                              } else {
                                optionLines.push(line); 
                              }
                            }
                          });`;

    const newContent = `                          const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
                          
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
                          });`;

    if (content.includes(targetContent)) {
      content = content.replace(targetContent, newContent);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated instruction parsing in', file);
    }
  }
});
