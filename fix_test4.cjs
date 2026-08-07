const fs = require('fs');
let code = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

const newTest4 = `  '4': {
    part1: [
      { id: 'p1_1', topic: 'Placeholder', text: 'Content to be added later.', sampleAnswer: 'Sample answer to be added later.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Content to be added later.',
      bulletPoints: [
        'Content to be added later.'
      ],
      sampleAnswer: 'Sample answer to be added later.'
    },
    part3: [
      { 
        id: 'p3_1', 
        topic: 'Placeholder', 
        text: 'Content to be added later.',
        sampleAnswer: 'Sample answer to be added later.'
      }
    ]
  },
`;

code = code.replace("export const IELTS_SPEAKING_QUESTIONS = {", "export const IELTS_SPEAKING_QUESTIONS = {\n" + newTest4);

fs.writeFileSync('src/data/speakingTestData.ts', code);
