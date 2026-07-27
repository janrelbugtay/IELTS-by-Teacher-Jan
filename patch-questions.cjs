const fs = require('fs');

const targetFile = 'src/pages/ComputerReadingTest.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

const targetContent = `<p className={\`font-medium text-[1em] leading-relaxed mt-1 \${theme.text} whitespace-pre-wrap\`}>`;

const newContent = `<p className={\`leading-relaxed mt-1 whitespace-pre-wrap \${(block.options && (block.options.includes('TRUE') || block.options.includes('YES'))) ? 'font-bold text-[1.05em] text-black ' + (colorTheme !== 'standard' ? 'text-white' : 'text-black') : 'font-medium text-[1em] ' + theme.text}\`}>`;

if (content.includes(targetContent)) {
  content = content.replace(targetContent, newContent);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Updated question block in', targetFile);
} else {
  console.log('Could not find target content in', targetFile);
}
