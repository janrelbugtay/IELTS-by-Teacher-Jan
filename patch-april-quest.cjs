const fs = require('fs');

const files = fs.readdirSync('src/pages').filter(f => f.endsWith('ReadingTest.tsx') && f !== 'ComputerReadingTest.tsx');

const targetQuest = `<p className={\`font-medium text-[1em] leading-relaxed \${theme.text} whitespace-pre-wrap\`}>`;
const newQuest = `<p className={\`leading-relaxed whitespace-pre-wrap \${(block.options && (block.options.includes('TRUE') || block.options.includes('YES'))) ? 'font-bold text-[1.05em] text-black ' + (colorTheme !== 'standard' ? 'text-white' : 'text-black') : 'font-medium text-[1em] ' + theme.text}\`}>`;

files.forEach(f => {
  let file = 'src/pages/' + f;
  let content = fs.readFileSync(file, 'utf8');

  if (content.includes(targetQuest)) {
    content = content.replace(targetQuest, newQuest);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated question text in', file);
  }
});
