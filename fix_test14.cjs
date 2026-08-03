const fs = require('fs');
let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');

// I will just replace double quotes with backticks for the instruction strings containing \n
content = content.replace(/instruction: "([^"]*?\n[^"]*?)"/g, (match, p1) => {
  return 'instruction: `' + p1 + '`';
});
content = content.replace(/text: "\*\*The domestication([\s\S]*?)"/g, (match, p1) => {
  return 'text: `**The domestication' + p1 + '`';
});
content = content.replace(/instruction: "Choose the correct heading([\s\S]*?)"/g, (match, p1) => {
  return 'instruction: `Choose the correct heading' + p1 + '`';
});
content = content.replace(/text: "In the second stage([\s\S]*?)"/g, (match, p1) => {
  return 'text: `In the second stage' + p1 + '`';
});
content = content.replace(/instruction: "Look at the following([\s\S]*?)"/g, (match, p1) => {
  return 'instruction: `Look at the following' + p1 + '`';
});
content = content.replace(/instruction: "Do the following statements agree([\s\S]*?)"/g, (match, p1) => {
  return 'instruction: `Do the following statements agree' + p1 + '`';
});

fs.writeFileSync('src/data/test14ReadingData.ts', content);
