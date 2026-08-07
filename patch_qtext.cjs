const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const target = `<p className={\`leading-relaxed mt-1 whitespace-pre-wrap \${(block.options && (block.options.includes('TRUE') || block.options.includes('YES'))) ? 'font-bold text-[1.05em] text-black ' + (colorTheme !== 'standard' ? 'text-white' : 'text-black') : 'font-medium text-[1em] ' + theme.text}\`}>`;

const replacement = `<p className={\`leading-relaxed mt-1 whitespace-pre-wrap font-medium text-[1em] \${theme.text}\`}>`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/ComputerReadingTest.tsx', code.replace(target, replacement));
  console.log("Patched question text successfully");
} else {
  console.log("Target question text not found");
}
