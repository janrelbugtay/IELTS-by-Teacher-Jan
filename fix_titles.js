const fs = require('fs');

let data = fs.readFileSync('src/data/octoberReadingData.ts', 'utf8');

data = data.replace(
    /"title": "Reading Passage 1",/,
    '"title": "Reading Passage 1",\n    "subtitle": "River Management and Flood Control",'
);

data = data.replace(
    /"title": "Reading Passage 2",/,
    '"title": "Reading Passage 2",\n    "subtitle": "Whale Culture",'
);

data = data.replace(
    /"title": "Reading Passage 3",/,
    '"title": "Reading Passage 3",\n    "subtitle": "Non-verbal Communication",'
);

fs.writeFileSync('src/data/octoberReadingData.ts', data);
console.log('Fixed');
