const fs = require('fs');

const files = fs.readdirSync('src/pages').filter(f => f.endsWith('ReadingTest.tsx'));

files.forEach(f => {
  let file = 'src/pages/' + f;
  let content = fs.readFileSync(file, 'utf8');

  // We are going to find `if (block.type !== 'input') return q.text;`
  // and replace it with our logic. Wait, our logic might have already been applied to some files.
  // Check if it already has `let displayQText = q.text;`
  if (!content.includes('let displayQText = q.text;')) {
    const searchString = `if (block.type !== 'input') return q.text;`;
    if (content.includes(searchString)) {
       // We replace exactly this line, because the next lines don't need changing! They already use `q.text` but we can change `q.text` to `displayQText`.
       // Let's do a regex replace to catch the `q.text` in `parts = q.text.split(regex);` and `if (parts.length <= 1) return q.text;`
       
       // Actually, easier: just prepend the definition of displayQText and replace the usages of q.text in those 3 lines.
       // The block is:
       /*
       if (block.type !== 'input') return q.text;
       const regex = new RegExp(...);
       const parts = q.text.split(regex);
       if (parts.length <= 1) return q.text;
       */
       const blockRegex = /if \(block\.type !== 'input'\) return q\.text;\s*const regex = new RegExp\([\s\S]*?\);\s*const parts = q\.text\.split\(regex\);\s*if \(parts\.length <= 1\) return q\.text;/;
       const match = content.match(blockRegex);
       if (match) {
         let newBlock = match[0].replace(/q\.text/g, 'displayQText');
         let prepend = `
                                    let displayQText = q.text;
                                    if (block.type === 'mcq' || block.type === 'matching') {
                                      const textLines = (q.text || '').split('\\n');
                                      const newMainText = [];
                                      textLines.forEach(l => {
                                         if (!/^[A-H][\\.\\)]?\\s+/.test(l.trim())) {
                                            newMainText.push(l);
                                         }
                                      });
                                      displayQText = newMainText.join('\\n');
                                    }\n                                    `;
         content = content.replace(match[0], prepend + newBlock);
         fs.writeFileSync(file, content, 'utf8');
         console.log('Fixed q.text rendering in', file);
       }
    }
  } else {
    // If it already has it, make sure it includes `block.type === 'matching'`
    if (!content.includes(`block.type === 'mcq' || block.type === 'matching'`)) {
       content = content.replace(`if (block.type === 'mcq') {`, `if (block.type === 'mcq' || block.type === 'matching') {`);
       fs.writeFileSync(file, content, 'utf8');
       console.log('Updated to include matching in', file);
    }
  }
});
