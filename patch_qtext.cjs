const fs = require('fs');
const file = 'src/pages/ComputerReadingTest.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                                    if (block.type !== 'input') return displayQText;`;
const replacement = `                                    if (displayQText && displayQText.trim() === \`Question \${q.id}\`) {
                                      displayQText = "";
                                    }
                                    if (block.type !== 'input') return displayQText;`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
console.log('patched q.text renderer');
