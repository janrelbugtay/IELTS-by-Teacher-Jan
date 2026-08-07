const fs = require('fs');

const files = fs.readdirSync('src/pages').filter(f => f.endsWith('ReadingTest.tsx'));

const results = {};

files.forEach(file => {
  const content = fs.readFileSync(`src/pages/${file}`, 'utf-8');
  const titles = [];
  const regex = /subtitle:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    titles.push(match[1]);
  }
  results[file] = titles;
});

console.log(JSON.stringify(results, null, 2));
