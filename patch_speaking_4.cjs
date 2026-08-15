const fs = require('fs');
let content = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

const emptyTemplate = `'4': {
    part1: [
      { id: 'p1_1', topic: '', text: '' },
      { id: 'p1_2', topic: '', text: '' },
      { id: 'p1_3', topic: '', text: '' },
      { id: 'p1_4', topic: '', text: '' },
      { id: 'p1_5', topic: '', text: '' },
      { id: 'p1_6', topic: '', text: '' },
      { id: 'p1_7', topic: '', text: '' },
      { id: 'p1_8', topic: '', text: '' },
      { id: 'p1_9', topic: '', text: '' }
    ],
    part2: {
      id: 'p2_1',
      topic: '',
      bulletPoints: [
        '',
        '',
        '',
        ''
      ]
    },
    part3: [
      { id: 'p3_1', topic: '', text: '' },
      { id: 'p3_2', topic: '', text: '' },
      { id: 'p3_3', topic: '', text: '' },
      { id: 'p3_4', topic: '', text: '' }
    ]
  },`;

// We need to replace the entire '4' object. It starts at `  '4': {` and ends before `  '3': {`.
const startIdx = content.indexOf("  '4': {");
const endIdx = content.indexOf("  '3': {", startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + emptyTemplate + '\n' + content.substring(endIdx);
  fs.writeFileSync('src/data/speakingTestData.ts', content);
  console.log("Successfully replaced '4'");
} else {
  console.error("Could not find start or end index");
}
