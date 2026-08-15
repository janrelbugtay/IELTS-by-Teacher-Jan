const fs = require('fs');

const path = 'src/data/speakingTestData.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `  '1': {
    part1: [
      { id: 'p1_1', topic: '', text: '' },
      { id: 'p1_2', topic: '', text: '' },
      { id: 'p1_3', topic: '', text: '' },
      { id: 'p1_4', topic: '', text: '' },
      { id: 'p1_5', topic: '', text: '' },
      { id: 'p1_6', topic: '', text: '' },
      { id: 'p1_7', topic: '', text: '' },
      { id: 'p1_8', topic: '', text: '' }
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
      { id: 'p3_4', topic: '', text: '' },
      { id: 'p3_5', topic: '', text: '' }
    ]
  },`;

// Find the block for '1' and replace it.
const startStr = "  '1': {";
const fallbackStr = "  'fallback': {";

const startIndex = content.indexOf(startStr);
const fallbackIndex = content.indexOf(fallbackStr);

if (startIndex !== -1 && fallbackIndex !== -1) {
  content = content.substring(0, startIndex) + replacement + "\n" + content.substring(fallbackIndex);
  fs.writeFileSync(path, content);
  console.log("Replaced '1' block in speakingTestData.ts");
} else {
  console.error("Could not find blocks");
}
