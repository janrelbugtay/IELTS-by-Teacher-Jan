const fs = require('fs');

const files = [
  'ComputerReadingTest.tsx', // January (ID 1)
  'FebruaryReadingTest.tsx', // February (ID 5)
  'MarchReadingTest.tsx', // March (ID 9)
  'AprilReadingTest.tsx', // April (ID 13)
  'MayReadingTest.tsx', // May (ID 17)
  // June (ID 21) - Use ComputerReadingTest.tsx (January) for now since it doesn't exist
  // July (ID 25)
  // August (ID 29)
];

const results = {};

files.forEach(file => {
  if (fs.existsSync(`src/pages/${file}`)) {
    const content = fs.readFileSync(`src/pages/${file}`, 'utf-8');
    const titles = [];
    const regex = /subtitle:\s*"([^"]+)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      titles.push(match[1]);
    }
    results[file] = titles;
  }
});

console.log(JSON.stringify(results, null, 2));
