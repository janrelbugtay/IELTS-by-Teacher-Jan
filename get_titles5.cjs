const fs = require('fs');
['octoberReadingData.ts', 'novemberReadingData.ts'].forEach(file => {
  const content = fs.readFileSync(`src/data/${file}`, 'utf-8');
  let match;
  let titles = [];
  const regex = /subtitle:\s*["']([^"']+)["']/g;
  while ((match = regex.exec(content)) !== null) {
    titles.push(match[1]);
  }
  
  if (titles.length === 0) {
    const titleRegex = /title:\s*["']([^"']+)["']/g;
    while ((match = titleRegex.exec(content)) !== null) {
      if (!match[1].includes('Question')) titles.push(match[1]);
    }
  }
  console.log(file, titles.slice(0,3));
});
