const fs = require('fs');
const files = fs.readdirSync('src/data').filter(f => f.endsWith('ReadingData.ts'));
const results = {};

files.forEach(file => {
  const content = fs.readFileSync(`src/data/${file}`, 'utf-8');
  const titles = [];
  const regex = /subtitle:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    titles.push(match[1]);
  }
  if (titles.length === 0) {
    const titleRegex = /title:\s*"([^"]+)"/g;
    let titleMatch;
    while ((titleMatch = titleRegex.exec(content)) !== null) {
      if (!titleMatch[1].includes('Question')) titles.push(titleMatch[1]);
    }
  }
  if (titles.length > 0) results[file] = titles;
});
console.log(JSON.stringify(results, null, 2));
