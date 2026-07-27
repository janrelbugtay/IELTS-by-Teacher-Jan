const fs = require('fs');

const targetFile = 'src/pages/ComputerReadingTest.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

const targetContent = `<p className={\`mt-2 whitespace-pre-wrap italic text-[1.25em] \${theme.boxSub}\`}>{block.instruction}</p>`;

const newContent = `{(() => {
  const isTFNG = block.options && (block.options.includes('TRUE') || block.options.includes('YES'));
  if (isTFNG) {
    return (
      <div className={\`mt-2 font-bold text-[1.25em] \${colorTheme !== 'standard' ? 'text-white' : 'text-black'}\`}>
        {block.instruction.split('\\n').map((line: string, idx: number) => {
          if (line.startsWith('TRUE') || line.startsWith('FALSE') || line.startsWith('NOT GIVEN') ||
              line.startsWith('YES') || line.startsWith('NO')) {
            const keyword = line.startsWith('NOT GIVEN') ? 'NOT GIVEN' : line.split(' ')[0];
            const rest = line.substring(keyword.length);
            return (
              <div key={idx} className="mt-1">
                <span className="uppercase text-[1.1em]">{keyword}</span>
                <span>{rest}</span>
              </div>
            );
          }
          return <div key={idx} className="mb-2">{line}</div>;
        })}
      </div>
    );
  }
  return <p className={\`mt-2 whitespace-pre-wrap italic text-[1.25em] \${theme.boxSub}\`}>{block.instruction}</p>;
})()}`;

if (content.includes(targetContent)) {
  content = content.replace(targetContent, newContent);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Updated instruction block in', targetFile);
} else {
  console.log('Could not find target content in', targetFile);
}
