const fs = require('fs');
let code = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

// we'll insert '2' after '1'
const test2 = `
  '2': {
    part1: [
      { id: 'p1_1', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p1_2', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p1_3', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p1_4', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p1_5', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p1_6', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p1_7', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p1_8', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p1_9', topic: '[Placeholder]', text: '[Placeholder]' }
    ],
    part2: {
      id: 'p2_1',
      topic: '[Placeholder]',
      bulletPoints: [
        '[Placeholder]',
        '[Placeholder]',
        '[Placeholder]',
        '[Placeholder]'
      ]
    },
    part3: [
      { id: 'p3_1', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p3_2', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p3_3', topic: '[Placeholder]', text: '[Placeholder]' },
      { id: 'p3_4', topic: '[Placeholder]', text: '[Placeholder]' }
    ]
  },`;

code = code.replace(`  '1': {`, test2 + `\n  '1': {`);

fs.writeFileSync('src/data/speakingTestData.ts', code);
