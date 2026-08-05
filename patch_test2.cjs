const fs = require('fs');
let code = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

const oldTest2 = `'2': {
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

const newTest2 = `'2': {
    part1: [
      { id: 'p1_1', topic: 'Where You Live', text: 'Let\\'s talk about where you live. What do you like most about the place where you live?' },
      { id: 'p1_2', topic: 'Where You Live', text: 'Is it a good place for young people? Why or why not?' },
      { id: 'p1_3', topic: 'Where You Live', text: 'Would you like to move to another place in the future? Why?' },
      { id: 'p1_4', topic: 'Study', text: 'Now let\\'s talk about your work or studies. What do you enjoy most about your work or studies?' },
      { id: 'p1_5', topic: 'Study', text: 'What subject or part of your work do you find the most challenging?' },
      { id: 'p1_6', topic: 'Singing', text: 'Now I\\'d like to ask you about singing. When do you usually sing?' },
      { id: 'p1_7', topic: 'Singing', text: 'Did you enjoy singing when you were a child?' },
      { id: 'p1_8', topic: 'Singing', text: 'Is singing a popular activity in your country?' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a tall building you like or dislike.',
      bulletPoints: [
        'where it is',
        'what it looks like',
        'why you visited it or know about it',
        'and explain why you like or dislike this building.'
      ]
    },
    part3: [
      { id: 'p3_1', topic: 'Skyscrapers', text: 'Why are cities building more skyscrapers nowadays?' },
      { id: 'p3_2', topic: 'Skyscrapers', text: 'What are the advantages of tall buildings?' },
      { id: 'p3_3', topic: 'Skyscrapers', text: 'Which do you think is better: living in a high-rise apartment or in a traditional house? Why?' },
      { id: 'p3_4', topic: 'Skyscrapers', text: 'Do you think cities should preserve old buildings instead of constructing new ones?' },
      { id: 'p3_5', topic: 'Skyscrapers', text: 'How do you think buildings will change in the future?' }
    ]
  },`;

if (code.includes(oldTest2)) {
    code = code.replace(oldTest2, newTest2);
    fs.writeFileSync('src/data/speakingTestData.ts', code);
    console.log('Successfully patched speaking test 2');
} else {
    console.log('Failed to patch, could not find exact placeholder text');
}
