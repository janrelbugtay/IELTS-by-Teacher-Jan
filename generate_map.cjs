const fs = require('fs');

const idToFile = {
  1: 'ComputerReadingTest.tsx', // Actually uses what's in ComputerReadingTest.tsx
  5: 'februaryReadingData.ts',
  9: 'marchReadingData.ts',
  13: 'aprilReadingData.ts',
  17: 'mayReadingData.ts',
  21: 'juneReadingData.ts',
  25: 'julyReadingData.ts',
  29: 'augustReadingData.ts',
  33: 'septemberReadingData.ts',
  37: 'octoberReadingData.ts',
  41: 'novemberReadingData.ts',
  45: 'decemberReadingData.ts',
  49: 'test13ReadingData.ts',
  53: 'test14ReadingData.ts',
  57: 'test15ReadingData.ts'
};

const map = {};

for (const [id, file] of Object.entries(idToFile)) {
  let content;
  if (id == 1) {
    content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf-8');
  } else {
    content = fs.readFileSync(`src/data/${file}`, 'utf-8');
  }
  
  let titles = [];
  const subtitleRegex = /subtitle:\s*["']([^"']+)["']/g;
  let match;
  while ((match = subtitleRegex.exec(content)) !== null) {
    titles.push(match[1]);
  }
  
  if (titles.length < 3) {
    titles = []; // reset
    const titleRegex = /title:\s*["']([^"']+)["']/g;
    let titleMatch;
    while ((titleMatch = titleRegex.exec(content)) !== null) {
      if (!titleMatch[1].toLowerCase().includes('question')) {
        titles.push(titleMatch[1]);
      }
    }
  }
  
  // ensure we have 3 titles
  while(titles.length < 3) titles.push('Passage');
  
  map[id] = titles.slice(0, 3);
}

console.log(map);
