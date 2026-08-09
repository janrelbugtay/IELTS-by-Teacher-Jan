const fs = require('fs');
let content = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

const testsStr = `
  'homework-test-1': {
    part1: [
      { id: 'p1_1', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_2', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_3', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_4', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_5', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_6', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_7', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_8', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Speaking Homework',
      bulletPoints: [
        'Please complete your speaking homework.',
        'Please complete your speaking homework.',
        'Please complete your speaking homework.',
        'Please complete your speaking homework.'
      ],
      sampleAnswer: 'Sample answer for speaking homework.'
    },
    part3: [
      {
        id: 'p3_1',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      },
      {
        id: 'p3_2',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      },
      {
        id: 'p3_3',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      }
    ]
  },
  'homework-test-2': {
    part1: [
      { id: 'p1_1', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_2', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_3', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_4', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_5', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_6', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_7', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_8', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Speaking Homework',
      bulletPoints: [
        'Please complete your speaking homework.',
        'Please complete your speaking homework.',
        'Please complete your speaking homework.',
        'Please complete your speaking homework.'
      ],
      sampleAnswer: 'Sample answer for speaking homework.'
    },
    part3: [
      {
        id: 'p3_1',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      },
      {
        id: 'p3_2',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      },
      {
        id: 'p3_3',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      }
    ]
  },
  'homework-test-3': {
    part1: [
      { id: 'p1_1', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_2', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_3', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_4', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_5', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_6', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_7', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' },
      { id: 'p1_8', topic: 'Speaking Homework', text: 'Please complete your speaking homework.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Speaking Homework',
      bulletPoints: [
        'Please complete your speaking homework.',
        'Please complete your speaking homework.',
        'Please complete your speaking homework.',
        'Please complete your speaking homework.'
      ],
      sampleAnswer: 'Sample answer for speaking homework.'
    },
    part3: [
      {
        id: 'p3_1',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      },
      {
        id: 'p3_2',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      },
      {
        id: 'p3_3',
        topic: 'Speaking Homework',
        text: 'Please complete your speaking homework.',
        sampleAnswer: 'Sample answer for speaking homework.'
      }
    ]
  },
`;

content = content.replace('export const IELTS_SPEAKING_QUESTIONS = {', 'export const IELTS_SPEAKING_QUESTIONS = {' + testsStr);
fs.writeFileSync('src/data/speakingTestData.ts', content);
console.log("Successfully patched speakingTestData.ts");
