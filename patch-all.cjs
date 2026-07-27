const fs = require('fs');

const targetFiles = [
  'src/pages/AprilReadingTest.tsx',
  'src/pages/FebruaryReadingTest.tsx',
  'src/pages/MayReadingTest.tsx',
  'src/pages/AugustReadingTest.tsx',
  'src/pages/MarchReadingTest.tsx'
];

const targetInst = `<p className={\`mt-2 whitespace-pre-wrap italic text-[1.25em] \${theme.boxSub}\`}>{block.instruction}</p>`;
const newInst = `{(() => {
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

const targetQuest = `<p className={\`font-medium text-[1em] leading-relaxed mt-1 \${theme.text} whitespace-pre-wrap\`}>`;
const newQuest = `<p className={\`leading-relaxed mt-1 whitespace-pre-wrap \${(block.options && (block.options.includes('TRUE') || block.options.includes('YES'))) ? 'font-bold text-[1.05em] text-black ' + (colorTheme !== 'standard' ? 'text-white' : 'text-black') : 'font-medium text-[1em] ' + theme.text}\`}>`;

targetFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    if (content.includes(targetInst)) {
      content = content.replace(targetInst, newInst);
      changed = true;
    }
    if (content.includes(targetQuest)) {
      content = content.replace(targetQuest, newQuest);
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  }
});
